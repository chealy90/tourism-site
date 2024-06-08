const URL = "json/landmarks.json"
const usersURL = "json/users.json"
let data
let users = []


let keys
let mainHeaders = ["Name", "Address", "Description", "Photo", "Tags", "Rating"]
let mainKeys = mainHeaders.map(field => field.toLowerCase())
let sortOrder = 1
let currentSortField = null

let sortables = ["Name", "Rating"]
let tagsList = new Set([])
let selectedTags

let currentUser

let imgIndex
let numImages
let images

let mode = "admin"
let nextEntryIndex


window.onload = () => {
    //users
    fetch(usersURL)
    .then(rawData => rawData.json())
    .then(userData => {
        users = userData       
    })



    fetch(URL)
    .then(rawData => rawData.json())
    .then(jsonData => {
        data = jsonData
        nextEntryIndex = data.length
        keys = Object.keys(data[0])


        //get tags and display them
        data.forEach(row => {
            row["tags"].forEach(tag => {
                tagsList.add(tag)
            })
        })
        selectedTags = [...tagsList]
        selectedTags.push("other")    
        let olElement = document.getElementById("tagsList")
        tagsList.forEach(tag => {
            let newLI = document.createElement("li")
            newLI.innerHTML = `<label>${tag}</label><input class="filterCB" type="checkbox"  value="${tag}" onchange="updateFilters()">`
            olElement.appendChild(newLI)
        })
        let newLI = document.createElement("li")
        newLI.innerHTML = `<label>other</label><input class="filterCB" type="checkbox"  value="other" onchange="updateFilters()">`
        olElement.appendChild(newLI)

        //initial display
        sort("id")
        displayTable(data)
        
    })  
}

function displayTable(displayData){
    //filter data
    displayData = displayData.filter(row => {
        let result = false
        //none selected selects all
        if (selectedTags.length===0){
            result = true
        } else {
            //direct match
            row["tags"].forEach(tag => {
                if (selectedTags.includes(tag)){
                    result = true
                }
            })
            //other selected includes those with no tags
            if (row["tags"].length===0 && selectedTags.includes("other")){
                result = true
            }
        }

        return result
    })

    




    //headers
    let htmlString = `<table><tr>`
    mainHeaders.forEach(header => {
        htmlString += `<th onclick='${sortables.includes(header)?"sort(this.id)":"null"}'  id=${header.toLowerCase()}>${header}${header.toLowerCase()===currentSortField? (sortOrder===1?'▲':'▼'):""}</th>`

    })



    //table rows
    displayData.forEach(row => {
        htmlString += `<tr onclick="expandRow('${row.id}')">`
        mainKeys.forEach(key=> {
            if (key==="photo"){
                htmlString += `<td><img class="tableImg" src=${row["photosURLs"][0]}></td>`
            }
            else if (key==="tags"){
                htmlString += "<td><ul class='tagsList'>"
                let tags = row["tags"]
                tags.forEach(tag => {
                    htmlString += `<li>${tag}</li>`
                })
                htmlString += "</ul></td>"
            }
            
            else {
                htmlString += `<td>${row[key]}</td>`
            }
            
        })
        htmlString += `</tr>`
    })

         
    htmlString += `</table>`
    document.getElementById("mainContent").innerHTML = htmlString
}



function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}




function sort(field){
    if (field===currentSortField){
        sortOrder *= -1
    } else {
        sortOrder = 1
    }

    data.sort((a,b) => a[field] > b[field] ? 1*sortOrder : -1*sortOrder)
    currentSortField = field

    displayTable(data)
}


function searchData(searchTerm){
    if (searchTerm!==""){
        let exp = new RegExp(searchTerm, "i")
        let searchedData = data.filter(row => exp.test(row.name))
        displayTable(searchedData)
    }
}

function updateFilters(){
    selectedTags = []
    let checkboxes = [...document.getElementsByClassName("filterCB")]
    checkboxes.forEach(cb => {
        if (cb.checked){
            selectedTags.push(cb.value)
        }
    })
    displayTable(data)  
}

function displayProfileModal(){
    let modalHtml = `
        <div class="modalAlpha">
        <div id="profileModal">
            <div class="modalExitButton" onclick="exitModal()">X</div>
            <h1>Log In As Admin</h1>`


    //display login
    if (mode==="guest"){
        modalHtml += `           
                <div id="loginForm">
                    <label for="username">Admin username</label>
                    <input type="text" name="username" id="usernameInput" required>

                    <label for="password">Admin password</label>
                    <input type="password" name="password" id="passwordInput" required>

                    <button type="button" class="loginButton" onclick="validateLogin()">Log In</button>
                </div>
        `
    } 
    //display logout
    else {
        modalHtml += `
        <div id="loginForm">
            <h3>Admin User: ${currentUser}</h3>
            <button type="button" class="loginButton" onclick="logout()">Log Out</button> 
        </div>`
    }
    



    modalHtml += `</div>
                </div>`

    let modalElement = document.createElement("div")
    modalElement.setAttribute("class", "modalContainer")
    modalElement.innerHTML = modalHtml
    //clear table first
    document.getElementById("mainContent").innerHTML = ""
    document.getElementsByTagName("body")[0].appendChild(modalElement)
    
}

function exitModal(){
    let modalElement = document.getElementsByClassName("modalContainer")[0]
    modalElement.remove()
    displayTable(data)
}

function validateLogin(){
    let usernameInput = document.getElementById("usernameInput").value
    let passwordInput = document.getElementById("passwordInput").value
    
    if (usernameInput in users == false){
        alert("Invalid Login. Please enter a valid username and password.")
        return
    } 

    if (users[usernameInput] !== passwordInput){
        alert("Invalid Login. Please enter a valid username and password.")
        return
    }

    mode = "admin"
    currentUser = usernameInput
    //replace UI
    document.getElementById("loginForm").innerHTML = 
        `<h3>Admin User: ${usernameInput}</h3>
        <button type="button" class="loginButton" onclick="logout()">Log Out</button>`   


    
    //enable adding new items
    let newOption = document.createElement("div")
    newOption.onclick = displayAddModal
    newOption.id = "createEntryDiv"
    newOption.innerHTML = `<h2>Create Entry</h2>
                           <div id="plusIcon">+</div>`

    document.getElementById("actionDivs").appendChild(newOption)
    
    

    
}

function logout(){
    usernameInput = ""
    passwordInput = ""
    mode = "guest"

    document.getElementById("loginForm").innerHTML = `
        <label for="username">Admin username</label>
        <input type="text" name="username" id="usernameInput" required>

        <label for="password">Admin password</label>
        <input type="password" name="password" id="passwordInput" required>

        <button type="button" class="loginButton" onclick="validateLogin()">Log In</button>
        `
    document.getElementById("createEntryDiv").remove()

}


function expandRow(rowId){
    let row = data.filter(row => row.id == rowId)[0]
    let mapsURL = `https://google.ie/maps/@${row.latitude},${row.longitude},20z?entry=ttu`
    let modalHtml = `
        <div class="modalAlpha">
        <div id="infoDisplayDiv">
            <div id="infoModalTopRow">
                <div class="modalExitButton" onclick="exitModal()">X</div>
                <h1>${row.name}</h1>
                <h2>Rating: ${row.rating}</h2>
            </div>

            <div id="infoModalRowTwo">  
                <div>${row.description}</div>

                <div id="addressDiv">
                    <div><b>${row.address}</b></div>

                    <div id="coordsDiv">
                        <div>
                            <h4>Latitude</h4>
                            <p>${row.latitude}</p>
                        </div>
                        <div>
                            <h4>Longitude</h4>
                            <p>${row.longitude}</p>
                        </div>
                        <a href="${mapsURL}" target="_blank">
                            <img src="images/google-maps.png"> 
                        </a>
                    </div>

                    <div>
                        <p>Contact: ${row.phoneNumber === "" ? "-" :row.phoneNumber}</p>
                    </div>

                </div>
            </div>`


            //tags ----------
            modalHtml += `
            <div id="infoModalRowThree">
                <p>Tags:</p>
                <ul>`          
            if (row.tags.length!==0){
                row.tags.forEach(tag => {
                    modalHtml += `<li>${tag}</li>`
                })
            }

            numImages = row.photosURLs.length
            imgIndex = 0
            images = row.photosURLs.map(imgData => {
                let img = new Image()
                img.width = 700
                img.src = imgData
                img.classList.add("galleryImg")
                return img
            })
            


            modalHtml += `</ul>
                            </div>

            <div id="infoModalGalleryRow">
                <div id="slideshowContainer">
                    <div id="imagesContainer">
                        <div id="images"></div>
                    </div>
                </div> 
                <div id="dots">
                
                </div>            
            </div>
        </div>
        </div>`

    


    let modalElement = document.createElement("div")
    modalElement.setAttribute("class", "modalContainer")
    modalElement.innerHTML = modalHtml
    //clear table first
    document.getElementById("mainContent").innerHTML = ""
    document.getElementsByTagName("body")[0].appendChild(modalElement)  

    //add gallery images
    let container = document.getElementById("imagesContainer")
    let imagesContainer = document.getElementById("images")
    let dotsContainer = document.getElementById("dots")
    for (let i=0;i<images.length;i++){
        let input = document.createElement("input")
        input.name = `img${i}`
        input.type = "radio"
        input.id = `img${i}`
        container.appendChild(input)
        images[i].id = `m${i}`
        imagesContainer.appendChild(images[i])
        let newDot = document.createElement("label")
        newDot.setAttribute("for", `img${i}`)
        newDot.classList.add("galleryDotButton")
        newDot.onclick = () => {
            //console.log(document.getElementById("imagesContainer").children)
        }
        dotsContainer.appendChild(newDot)

    }
    //add admin controls
    if (mode==="admin"){
        let adminRow = document.createElement("div")
        adminRow.id = "infoModalAdminRow"
        adminRow.innerHTML = `
            <div id="rowEdit" class="adminAction" onclick="displayEditModal(${row.id})">Edit Entry</div>
            <div id="rowDelete" class="adminAction" onclick="displayDeleteModal(${row.id}, '${row.name}')">Delete Entry</div>`
        document.getElementById("infoDisplayDiv").appendChild(adminRow)


    } 
    
}

function displayDeleteModal(id, name){
    document.getElementsByClassName("modalContainer")[0].remove()

    let modal = document.createElement("div")
    modal.classList.add("modalContainer")
    
    modal.innerHTML += `<div class="modalAlpha">
                            <div id="deleteModal">
                                <div><h2>Are you sure you want to delete ${name}? This cannot be undone.</h2></div>
                                <div id="deleteActions">
                                    <div class="adminAction" id="deleteCancel" onclick="cancelDelete(${id})">Cancel</div>
                                    <div class="adminAction" id="deleteConfirm" onclick="deleteRow(${id})">Delete</div>
                                </div>
                            </div>
                        </div>`


    document.body.appendChild(modal)
}

function cancelDelete(id){
    document.getElementsByClassName("modalContainer")[0].remove()
    expandRow(id)
}

function deleteRow(id){
    let index 
    for (let i=0;i<data.length;i++){
        if (data[i].id === id){
            index = i
            break
        }
    }
    data.splice(index, 1)
    document.getElementsByClassName("modalContainer")[0].remove()
    displayTable(data)
}

function displayEditModal(rowId){
    let row = data.filter(row => row.id === rowId)[0]
    let modal = document.createElement("div")
    modal.classList.add("modalContainer")
    modal.id = "editContainer"
    modal.innerHTML = `
        <div class="modalAlpha">
            <div id="editBox">
                <div class="modalExitButton" onclick="exitEdit(${rowId})">X</div>
                <h1>Edit Row</h1>
                <div class="editGrouping editRow">
                    <label for="name">Name:</label><input id="nameInput" name="name" type="text" value="${row.name}">
                    <label for="rating">Rating</label><input id="ratingInput" name="rating" type="text" value=${row.rating}>
                </div>
                
                <div class="editGrouping editCol">
                    <label for="description">Description:</label><textarea id="descInput" name="description" type="textbox">${row.description}</textarea>       
                </div>     
                
                <div class="editGrouping editCol">
                    <div class="editGrouping editRow editRowNoPadding">
                    <label for="address">Address</label><input id="addressInput" name="address" type="textbox" value="${row.address}">
                    </div>
                    <div class="editGrouping editRow editRowNoPadding">
                        <label for="lat">Latitude:</label><input name="lat" id="latInput" type="text" value=${row.latitude}>
                        <label for="long">Longitude:</label><input name="long" id="longInput" type="text" value=${row.longitude}>
                    </div>
                </div>

                <div class="editGrouping editRow">
                    <label for="phone">Contact Number:</label><input id="phoneInput" name="phone" type="text" value="${row.phoneNumber}">
                </div>

                <div id="tagsDiv" class="editGrouping editCol">
                    <h2>Tags Manager</h2>
                    <div class="tagsManagerMain">
                        <ul id="tagsUL">                    
                        </ul>
                        <div class="addTagsDiv">       
                            <input type="text" class="newTagInput">
                            <button type="button" onclick="addTag(${rowId})">Add Tag</button>
                        </div>
                    </div>
                </div>

                <div id="photosEditGrouping" class="editGrouping editCol">
                    <h2>Photos Manager</h2>
                    <div id="newPhotoDiv">
                        <input type="file" id="imageFileInput">
                        <button type="button" onclick="addImage()">Add Image</button>
                    </div>
                    <div class="editGrouping editRow editRowNoPadding" id="photosEditDiv">

                    </div>
                </div>

                <div id="editActions">
                    <div class="adminAction" id="cancelEdit" onclick="exitEdit(${rowId})">Cancel</div>
                    <div class="adminAction" id="confirmEdit" onclick="commitEdit(${rowId})">Commit Changes</div>
                </div>


            <div>
        </div>`

    


    document.getElementsByClassName("modalContainer")[0].remove()
    document.body.appendChild(modal)


    tagsUL = document.getElementById("tagsUL")
    row.tags.forEach(tag => {
        tagsUL.innerHTML += `<li class="tagsLI" id="tag_${tag}"><span>${tag}</span><div class="deleteTagButton" onclick="deleteTag('${tag}')">X</div></li>`
    })

    //add images
    let photosDiv = document.getElementById("photosEditDiv")
    row.photosURLs.forEach((photo, index) => {
        console.log(index)
        photosDiv.innerHTML += `<div class="editUnit">
                                    <div class="imgEditX" id="deleteForImg_${index}" onclick="deleteImg(${index})">X</div>
                                    <img class="editImg" id="img_${index}" src="${photo}" width="100px">
                                </div>`
    })
}

function exitEdit(rowId){
    document.getElementsByClassName("modalContainer")[0].remove()
    expandRow(rowId)
}

function commitEdit(rowId){
    let row = data.filter(row => row.id === rowId)[0]



    row.name = document.getElementById("nameInput").value
    row.rating = document.getElementById("ratingInput").value
    row.description = document.getElementById("descInput").value
    row.address = document.getElementById("addressInput").value
    row.latitude = document.getElementById("latInput").value
    row.longitude = document.getElementById("longInput").value
    row.phoneNumber = document.getElementById("phoneInput").value


    //update tags
    let newTags = []
    let documentTags = Array.from(document.getElementsByClassName("tagsLI"))
    documentTags.forEach(tag => {
        let tagValue = tag.firstChild.innerHTML

        newTags.push(tagValue)
        console.log(tagsList.has(tagValue))
        if (!tagsList.has(tagValue)){
            tagsList.add(tagValue)
            document.getElementById("tagsList").innerHTML += `<li><label>${tagValue}</label><input class="filterCB" type="checkbox"  value="${tagValue}" onchange="updateFilters()"></li>`
        }
    })
    row.tags = newTags

    //update images
    let newImages = []
    let documentImgs = [...document.getElementsByClassName("editImg")]
    documentImgs.forEach(img => {
        newImages.push(img.src)
    })

    row.photosURLs = newImages

    


    document.getElementsByClassName("modalContainer")[0].remove()
    expandRow(rowId)
}


function deleteTag(tag){
    document.getElementById(`tag_${tag}`).remove()
}

function addTag(rowId){
    let newTag = document.getElementsByClassName("newTagInput")[0].value
    document.getElementById("tagsUL").innerHTML += `<li class="tagsLI" id="tag_${newTag}"><span>${newTag}</span><div class="deleteTagButton" onclick="deleteTag(${rowId}, '${newTag}')">X</div></li>`
    document.getElementsByClassName("newTagInput")[0].value = ""
}

function displayAddModal(){ 
    let modal = document.createElement("div")
    modal.classList.add("modalContainer")
    modal.id = "addContainer"

    modal.innerHTML = `
        <div class="modalAlpha">
            <div id="editBox">
                <div class="modalExitButton" onclick="exitAdd()">X</div>
                <h1>Create Entry</h1>
                <div class="editGrouping editRow">
                    <label for="name">Name:</label><input id="nameInput" name="name" type="text">
                    <label for="rating">Rating</label><input id="ratingInput" name="rating" type="text">
                </div>
                
                <div class="editGrouping editCol">
                    <label for="description">Description:</label><textarea id="descInput" name="description" type="textbox"></textarea>       
                </div>     
                
                <div class="editGrouping editCol">
                    <div class="editGrouping editRow editRowNoPadding">
                    <label for="address">Address</label><input id="addressInput" name="address" type="textbox">
                    </div>
                    <div class="editGrouping editRow editRowNoPadding">
                        <label for="lat">Latitude:</label><input id="latInput" name="lat" type="text">
                        <label for="long">Longitude:</label><input id="longInput" name="long" type="text">
                    </div>
                </div>

                <div class="editGrouping editRow">
                    <label for="phoneInput">Contact Number:</label><input id="phoneInput" name="long" type="text">
                </div>

                <div id="tagsDiv" class="editGrouping editCol">
                    <h2>Tags Manager</h2>
                    <div class="tagsManagerMain">
                        <ul id="tagsUL">                    
                        </ul>
                        <div class="addTagsDiv">       
                            <input type="text" class="newTagInput">
                            <button type="button" onclick="addTag('new')">Add Tag</button>
                        </div>
                    </div>
                </div>

                <div id="photosEditGrouping" class="editGrouping editCol">
                    <h2>Photos Manager</h2>
                    <div id="newPhotoDiv">
                        <input type="file" id="imageFileInput">
                        <button type="button" onclick="addImage()">Add Image</button>
                    </div>
                    <div class="editGrouping editRow editRowNoPadding" id="photosEditDiv">

                    </div>
                </div>

                <div id="editActions">
                    <div class="adminAction" id="cancelEdit" onclick="exitAdd()">Cancel</div>
                    <div class="adminAction" id="confirmEdit" onclick="createNewEntry()">Create</div>
                </div>


            <div>
        </div>`

    document.getElementById("mainContent").innerHTML = ""
    document.body.appendChild(modal)
}


function exitAdd(){
    document.getElementsByClassName("modalContainer")[0].remove()
    displayTable(data)
}


function createNewEntry(){
    let row = {}
    
    row.id = nextEntryIndex
    nextEntryIndex++ 

    row.name = document.getElementById("nameInput").value
    row.rating = document.getElementById("ratingInput").value
    row.description = document.getElementById("descInput").value
    row.address = document.getElementById("addressInput").value
    row.latitude = document.getElementById("latInput").value
    row.longitude = document.getElementById("longInput").value
    row.phoneNumber = document.getElementById("phoneInput").value
    row.photosURLs = []

    //add tags
    let newTags = []
    let documentTags = Array.from(document.getElementsByClassName("tagsLI"))
    documentTags.forEach(tag => {
        let tagValue = tag.firstChild.innerHTML

        newTags.push(tagValue)
        console.log(tagsList.has(tagValue))
        if (!tagsList.has(tagValue)){
            tagsList.add(tagValue)
            document.getElementById("tagsList").innerHTML += `<li><label>${tagValue}</label><input class="filterCB" type="checkbox"  value="${tagValue}" onchange="updateFilters()"></li>`
        }
    })
    row.tags = newTags

    //add images
    let newImages = []
    let documentImgs = [...document.getElementsByClassName("editImg")]
    documentImgs.forEach(img => {
        newImages.push(img.src)
    })
    row.photosURLs = newImages


    data.push(row)
    exitAdd()   
}


function deleteImg(index){
    document.getElementById(`img_${index}`).remove()
    document.getElementById(`deleteForImg_${index}`).remove()

}

function addImage(){
    let path = document.getElementById("imageFileInput").value.split("\\")
    if (path===""){
        return
    }
    path = path[path.length-1]
    let images = [...document.getElementsByClassName("editImg")]
    console.log(images)
    if (images.length===0){
        index = 0
    } else {
        index = images[images.length-1].id.split("_")[1]
    }
    

    //add item to display
    document.getElementById("photosEditDiv").innerHTML += 
                `<div class="editUnit">
                    <div class="imgEditX" id="deleteForImg_${index}" onclick="deleteImg(${index})">X</div>
                    <img class="editImg" id="img_${index}" src="${`../images/${path}`}" width="100px">
                </div>`

    //reset file input
    document.getElementById("imageFileInput").value = ""

}





/*
name, lat, long, address, description, phone, photos, tags, rating
▼▲
/*
TODO
---- fix style on adding/removing images, validation, fix gallery, fix how table looks when empty
*/