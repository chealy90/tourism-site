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
        keys = Object.keys(data[0])


        //get tags and display them
        data.forEach(row => {
            row["tags"].forEach(tag => {
                tagsList.add(tag)
            })
        })
        selectedTags = [...tagsList]
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
    console.log(selectedTags)
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
        console.log("here")


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
                    <label for="rating" id="ratingInput">Rating</label><input name="rating" type="text" value=${row.rating}>
                </div>
                
                <div class="editGrouping editCol">
                    <label for="description" id="descInput">Description:</label><textarea name="description" type="textbox">${row.description}</textarea>       
                </div>     
                
                <div class="editGrouping editCol">
                <label for="address" id="addressInput">Address</label><input name="address" type="textbox" value="${row.address}">
                <div class="editGrouping editRow">
                    <label for="lat">Latitude:</label><input name="lat" type="text" value=${row.latitude}>
                    <label for="long">Longitude:</label><input name="long" type="text" value=${row.longitude}>
                </div>
                </div>

                <div class="editGrouping editRow">
                    <label for="long">Contact Number:</label><input name="long" type="text" value=${row.phoneNumber}>
                </div>

                <div id="tagsDiv" class="editGrouping">
                    <ul id="tagsUL">
                    
                    </ul>
                </div>

                <div id="photosEditDiv">

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
        tagsUL.innerHTML += `<li class="tagsLI">${tag}</li>`
    })
}

function exitEdit(rowId){
    document.getElementsByClassName("modalContainer")[0].remove()
    expandRow(rowId)
}

function commitEdit(rowId){
    let row = data.filter(row => row.id === rowId)[0]



    row.name = document.getElementById("nameInput").value

    document.getElementsByClassName("modalContainer")[0].remove()
    expandRow(rowId)
}



function setMode(newMode){
    mode = newMode
}



/*
name, lat, long, address, description, phone, photos, tags, rating
▼▲
/*
TODO
fetch data
basic table

sort / search

---- fix gallery, finish commit edit function, review style for edit page



add basic admin screen
basic edit
basic add
delete


*/