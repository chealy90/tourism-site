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

let mode = "guest"


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
            newLI.innerHTML = `<label>${tag}</label><input class="filterCB" type="checkbox" checked  value="${tag}" onchange="updateFilters()">`
            olElement.appendChild(newLI)
        })
        let newLI = document.createElement("li")
        newLI.innerHTML = `<label>other</label><input class="filterCB" type="checkbox" checked  value="other" onchange="updateFilters()">`
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
    let row = data.filter(row => row.id = rowId)
    let modalHtml = `
        <div class="modalAlpha">
            <div class="exitModalButton" onclick="exitModal()">X</div>
            
        </div>
    `
}



/*
name, lat, long, address, description, phone, photos, tags, rating
▼▲
/*
TODO
fetch data
basic table

sort / search

---- add complex view screen in expand row



add basic admin screen
basic edit
basic add
delete


*/