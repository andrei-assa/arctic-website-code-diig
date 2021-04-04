// JS for upload-data.html
// Main functions:
// 1. loadInitial() : loads the initial state of the page.
// 2. submitData() : triggered when submit button is pressed
// 3.


const AWS = require('aws-sdk');
// Set the AWS region
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = {
    accessKeyId: "",
    secretAccessKey: ""
};
// Create S3 service object
const s3 = new AWS.S3();
// Set the parameters
const myBucket = "website-data-upload"; //BUCKET_NAME
const keyString = `${Date.now()}.json`
const myKey = keyString; // FILE_NAME
const signedUrlExpireSeconds = 60 * 5; //EXPIRATION

const presignedURL = s3.getSignedUrl('putObject', {
    Bucket: myBucket,
    Key: myKey,
    Expires: signedUrlExpireSeconds
})
console.log(presignedURL)

// submit-reset-div contains submit and reset buttons;
// initially, these are in hidden state, but become visible when tabulator data is rendered to the page.

function loadInitial() {
    // The div containing the submit and reset buttons that appear after data has been submitted is initially displayed on page load; this div should be hidden.
    const submitResetDiv = document.getElementById("submit-reset-div")
    submitResetDiv.style.display = "none"

    // Add an eventListener to the submit button.
    const submitButton = document.getElementById("submit-data-btn")
    submitButton.addEventListener("click", submitData)
}

// #########################################################################
// Add an eventListener to the window to execute loadInitial() when the // #
// page loads.                                                          // #
// Execute loadInitial on page load.                                    // #
window.addEventListener("load", loadInitial) // #
//                                                                      // #
//                                                                      // #
// #########################################################################


function submitData(e) {
    // Prevent default behavior
    e.preventDefault()
    const config = {
        delimiter: "", // auto-detect
        newline: "", // auto-detect
        quoteChar: '"',
        escapeChar: '"',
        header: false,
        transformHeader: undefined,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: false,
        comments: false,
        step: undefined,
        complete: completeFn,
        error: undefined,
        download: false,
        downloadRequestHeaders: undefined,
        downloadRequestBody: undefined,
        skipEmptyLines: false,
        chunk: undefined,
        chunkSize: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
        withCredentials: undefined,
        transform: undefined
    }
    $("#uploadFile").parse({
        config: config
    })
}


// Utililty Functions
// 1. formatFieldName : alters the column names of the table, convering them to snake case.
function formatFieldName(field) {
    let word = []
    for (var letterIdx = 0; letterIdx < field.length; letterIdx++) {
        var letter = field[letterIdx]
        if (letter === " ") { // if the letter is a space
            word.push("_") // substitute with an underscore
        }
        else {
            word.push(letter) // otherwise push the letter on the array
        }
    }
    word = word.join("") // clean up the words
    return word
}

function getTabulatorData(tabulatorDiv) {
    return Tabulator.prototype.findTable(tabulatorDiv)[0].getData()
}

function uploadFn(results) {
    async function get_signed_url(url) {
        const response = await axios.get(url);
        console.log(response)

    }
    const API_ENDPOINT = "https://poqjpb36k0.execute-api.us-east-1.amazonaws.com/getPresignedURLForWebsite";


    get_signed_url(API_ENDPOINT).then(async(url) => {
        const data = getTabulatorData("#targetDiv")
        // console.log('Uploading data:', JSON.stringify(data));
        await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        });
    })
}




// The function that runs once data loading from local file is completed.
// After Papaparse
function completeFn(results) {
    // Assume that column names are in the first column
    const [columnNames] = results.data; // Array containing names of all columns
    const data = results.data.slice(1, results.data.length) // all results except the first row

    // 1. Create the columns.
    function createColumns(columnNames) { // Function that identifies individual column names
        const columns = [] // local variable columns which is ultimately returned
        let i;
        for (i = 0; i < columnNames.length; i++) {
            let title = columnNames[i]; // loop over the columns, grab the title
            title = title.trim() // remove extra whitespace
            let field;
            field = title.toLowerCase(); // lowercase the word
            field = formatFieldName(field)
            let align = "left"
            let editor = true
            columns.push({
                "title": title,
                "field": field,
                "align": align,
                "editor": editor
            })
        }
        return columns
    };

    let columns = createColumns(columnNames)
    // 2. Empty array for the table data.
    let tabledata = []
    // Function that will convert the data arrays.

    // Function that inserts each item of data into a "cell" in the table
    function convertArray(array, id) {
        let resultRow = {};
        let i;
        for (i = 0; i < array.length; i++) {
            let columnField = columns[i].field // Get the field name from the column object.
            if (i === 0) { // if we are on the first column, add an id value.
                resultRow["id"] = id
                resultRow[columnField] = array[i] // Then add the actual value
            }
            else {
                resultRow[columnField] = array[i] // If we are on any column besides the first column, just add the actual value.
            }
        }
        return resultRow
    };

    for (let i = 0; i < data.length; i++) {
        let row = data[i];
        tabledata.push(convertArray(row, i))
    }

    // Create the Tabulator instance using the configuration below, and passing in the tabledata from the above steps.
    let table = new Tabulator("#targetDiv", {
        data: tabledata,
        columns: columns,
        responsiveLayout: "hide",
        layout: "fitColumns",
        tooltips: true,
        addRowPos: "top",
        history: true,
        pagination: "local",
        paginationSize: 10,
        movableColumns: true,
        resizableRows: true
    });

    // Hide the form container and show the submit-reset div
    let formContainer = $("#form-container")
    formContainer[0].style.display = "none"
    const submitResetDiv = document.getElementById("submit-reset-div");
    submitResetDiv.style.display = "flex"

    // Get the reset button, add a click eventListener.
    document.getElementById("reset").addEventListener("click",
        // Event listener for the reset button will:
        // 1. Remove all children of the targetDiv
        // 2. Hide the submit-reset-div
        // 3. Replace the old target div with a new target div.
        // 4. The ID of the new target div will be set to the same name "targetDiv"
        function(e) {
            document.querySelector("#uploadFile").value = null
            e.preventDefault()
            let targetDiv;
            targetDiv = document.getElementById("targetDiv");
            let i;
            for (i = 0; i < targetDiv.children.length; i++) {
                targetDiv.removeChild(targetDiv.children[i])
            }
            document.getElementById("submit-reset-div").style.display = "none"
            let newTargetDiv = document.createElement("div")
            newTargetDiv.id = "targetDiv"
            let oldTargetDiv = document.querySelector("#targetDiv")
            let parentNode = oldTargetDiv.parentNode
            parentNode.replaceChild(newTargetDiv, oldTargetDiv)

            // The form-container element has a class of container-modified which is displayed flex
            document.getElementById("form-container").style.display = "flex"
        })

    document.getElementById("upload-data").addEventListener("click", uploadFn)

}
