const ps = new PerfectScrollbar("#cells", {
    wheelSpeed: 15,
    wheelPropagation: true
});


for (let i = 1; i <= 100; i++) {
    let str = "";
    let n = i;

    while (n > 0) {
        let rem = n % 26;
        if (rem == 0) {
            str = "Z" + str;
            n = Math.floor(n / 26) - 1;
        }
        else {
            str = String.fromCharCode(rem - 1 + 65) + str;
            n = Math.floor(n / 26);
        }
    }

    $("#columns").append(`<div class="column-name">${str}</div>`)
    $("#rows").append(`<div class="row-name">${i}</div>`)
}

let cellData = {
    "Sheet1": {}
};

let selectedSheet = "Sheet1";
let totalSheets = 1;
let lastlyAddedSheet = 1;

let defaultProperties = {
    "font-family": "Noto Sans",
    "font-size": 14,
    "text": "",
    "bold": false,
    "italic": false,
    "underlined": false,
    "alignment": "left",
    "color": "#444",
    "bgcolor": "#fff"
}

for (let i = 1; i <= 100; i++) {
    let row = $(`<div class="cell-row"></div>`);
    for (let j = 1; j <= 100; j++) {
        row.append(`<div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>`)
    }
    $("#cells").append(row);
}

$("#cells").scroll(function () {
    $("#columns").scrollLeft(this.scrollLeft);
    $("#rows").scrollTop(this.scrollTop);
})

$(".input-cell").dblclick(function (e) {
    $(".input-cell.selected").removeClass("selected top-selected bottom-selected left-selected right-selected");
    $(this).addClass("selected");
    $(this).attr("contenteditable", "true");
    $(this).focus();
})

$(".input-cell").blur(function () {
    updateCellData("text", $(this).text());
    $(this).attr("contenteditable", "false");
})

function getRowCol(ele) {
    let id = $(ele).attr("id");
    let idArray = id.split("-");
    let rowId = parseInt(idArray[1]);
    let colId = parseInt(idArray[3]);
    return [rowId, colId];
}

function getTopLeftBottomRightCell(rowId, colId) {
    let topCell = $(`#row-${rowId - 1}-col-${colId}`);
    let bottomCell = $(`#row-${rowId + 1}-col-${colId}`);
    let leftCell = $(`#row-${rowId}-col-${colId - 1}`);
    let rightCell = $(`#row-${rowId}-col-${colId + 1}`);
    return [topCell, bottomCell, leftCell, rightCell];
}

$(".input-cell").click(function (e) {
    let [rowId, colId] = getRowCol(this);
    let [topCell, bottomCell, leftCell, rightCell] = getTopLeftBottomRightCell(rowId, colId);

    if ($(this).hasClass("selected") && e.ctrlKey) {
        unselectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    }
    else {
        selectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    }

})

function unselectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if ($(ele).hasClass("top-selected")) {
        topCell.removeClass("bottom-selected");
    }

    if ($(ele).hasClass("bottom-selected")) {
        bottomCell.removeClass("top-selected");
    }

    if ($(ele).hasClass("left-selected")) {
        leftCell.removeClass("right-selected");
    }

    if ($(ele).hasClass("right-selected")) {
        rightCell.removeClass("left-selected");
    }

    $(ele).removeClass("selected top-selected bottom-selected left-selected right-selected");
}

function selectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if (e.ctrlKey) {

        let topSelected;
        if (topCell) {
            topSelected = topCell.hasClass("selected");
        }

        let bottomSelected;
        if (bottomCell) {
            bottomSelected = bottomCell.hasClass("selected");
        }

        let leftSelected;
        if (leftCell) {
            leftSelected = leftCell.hasClass("selected");
        }

        let rightSelected;
        if (rightCell) {
            rightSelected = rightCell.hasClass("selected");
        }

        if (topSelected) {
            $(ele).addClass("top-selected");
            topCell.addClass("bottom-selected");
        }

        if (bottomSelected) {
            $(ele).addClass("bottom-selected");
            bottomCell.addClass("top-selected");
        }

        if (leftSelected) {
            $(ele).addClass("left-selected");
            leftCell.addClass("right-selected");
        }

        if (rightSelected) {
            $(ele).addClass("right-selected");
            rightCell.addClass("left-selected");
        }
    }
    else {
        $(".input-cell.selected").removeClass("selected top-selected bottom-selected left-selected right-selected");
    }
    $(ele).addClass("selected");
    changeHeader(getRowCol(ele))
}

function changeHeader([rowId, colId]) {
    // console.log(cellData);
    let data = defaultProperties;
    if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]) {
        data = cellData[selectedSheet][rowId - 1][colId - 1];
    }
    $(".alignment.selected").removeClass("selected");
    $(`.alignment[data-type=${data.alignment}]`).addClass("selected");

    addRemoveSelectFromFontStyle(data, "bold");
    addRemoveSelectFromFontStyle(data, "italic");
    addRemoveSelectFromFontStyle(data, "underlined");

    $("#fill-color").css("border-bottom", `4px solid ${data.bgcolor}`);
    $("#text-color").css("border-bottom", `4px solid ${data.color}`);

    $("#font-family").val(data["font-family"]);
    $("#font-size").val(data["font-size"]);
    $("#font-family").css("font-family", data["font-family"]);
}

function addRemoveSelectFromFontStyle(data, property) {
    if (data[property]) {
        $(`#${property}`).addClass("selected");
    }
    else {
        $(`#${property}`).removeClass("selected");
    }
}

let startcellSelected = false;
let startCell = {};
let endCell = {};

let scrollXRStarted = false;
let scrollXLStarted = false;

$(".input-cell").mousemove(function (e) {
    e.preventDefault();
    if (e.buttons == 1) {
        // if (e.pageX > ($(window).width() - 10) && !scrollXRStarted) {
        //     scrollXR();
        // }
        // else if (e.pageX < 10 && !scrollXLStarted) {
        //     scrollXL();
        // }

        if (!startcellSelected) {
            let [rowId, colId] = getRowCol(this);
            startCell = { rowId, colId };
            startcellSelected = true;
            selectAllBetweenCells(startCell, startCell);
        }
    }
    else {
        startcellSelected = false;
    }

})

$(".input-cell").mouseenter(function (e) {

    if (e.pageX < ($(window).width() - 10) && scrollXRStarted) {
        clearInterval(scrollInterval);
        scrollXRStarted = false;
    }

    if (e.pageX > 10 && scrollXLStarted) {
        clearInterval(scrollInterval);
        scrollXLStarted = false;
    }

    if (e.buttons == 1) {
        let [rowId, colId] = getRowCol(this);
        endCell = { rowId, colId };
        selectAllBetweenCells(startCell, endCell);
    }
})

function selectAllBetweenCells(start, end) {
    $(".input-cell.selected").removeClass("selected top-selected bottom-selected left-selected right-selected");
    for (let i = Math.min(start.rowId, end.rowId); i <= Math.max(start.rowId, end.rowId); i++) {
        for (let j = Math.min(start.colId, end.colId); j <= Math.max(start.colId, end.colId); j++) {
            let [topCell, bottomCell, leftCell, rightCell] = getTopLeftBottomRightCell(i, j);
            selectCell($(`#row-${i}-col-${j}`), { ctrlKey: true }, topCell, bottomCell, leftCell, rightCell);
        }
    }
}

$(".data-container").mousemove(function(e){
    if (e.buttons == 1) {
        if (e.pageX > ($(window).width() - 10) && !scrollXRStarted) {
            scrollXR();
        }
        else if (e.pageX < 10 && !scrollXLStarted) {
            scrollXL();
        }
    }
})



let scrollInterval;

function scrollXR() {
    scrollXRStarted = true;
    scrollInterval = setInterval(function () {
        $("#cells").scrollLeft($("#cells").scrollLeft() + 100);
    }, 100);
}

function scrollXL() {
    scrollXLStarted = true;
    scrollInterval = setInterval(function () {
        $("#cells").scrollLeft($("#cells").scrollLeft() - 100);
    }, 100);
}

$(".data-container").mouseup(function(e){
    clearInterval(scrollInterval);
    scrollXRStarted = false;
    scrollXLStarted = false;
})

$(".alignment").click(function () {
    let alignment = $(this).attr("data-type");
    $(".alignment.selected").removeClass("selected");
    $(this).addClass("selected");
    $(".input-cell.selected").css("text-align", alignment);
    updateCellData("alignment", alignment);

})

$("#bold").click(function (e) {
    setStyle(this, "bold", "font-weight", "bold");
});

$("#italic").click(function (e) {
    setStyle(this, "italic", "font-style", "italic");
});

$("#underlined").click(function (e) {
    setStyle(this, "underlined", "text-decoration", "underline");
});

function setStyle(ele, property, key, value) {
    if ($(ele).hasClass("selected")) {
        $(ele).removeClass("selected");
        $(".input-cell.selected").css(key, "");
        updateCellData(property, false);
    }
    else {
        $(ele).addClass("selected");
        $(".input-cell.selected").css(key, value);
        updateCellData(property, true);
    }
}


$(".pick-color").colorPick({
    'initialColor': "#abcd",
    'allowRecent': true,
    'recentMax': 5,
    'allowCustomColor': true,
    'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
    'onColorSelected': function () {
        if (this.color != "#ABCD") {
            if ($(this.element.children()[1]).attr("id") == "fill-color") {
                $(".input-cell.selected").css("background-color", this.color);
                $("#fill-color").css("border-bottom", `4px solid ${this.color}`);
                // $(".input-cell.selected").each((index, data) => {
                //     let [rowId, colId] = getRowCol(data);
                //     cellData[rowId - 1][colId - 1].bgcolor = this.color;
                // });
                updateCellData("bgcolor", this.color)
            }
            if ($(this.element.children()[1]).attr("id") == "text-color") {
                $(".input-cell.selected").css("color", this.color);
                $("#text-color").css("border-bottom", `4px solid ${this.color}`);
                // $(".input-cell.selected").each((index, data) => {
                //     let [rowId, colId] = getRowCol(data);
                //     cellData[rowId - 1][colId - 1].color = this.color;
                // });
                updateCellData("color", this.color);
            }
        }
    }
});

$("#fill-color").click(function (e) {
    setTimeout(() => {
        $(this).parent().click();
    }, 10);
});

$("#text-color").click(function (e) {
    setTimeout(() => {
        $(this).parent().click();
    }, 10);
});

$(".menu-selector").change(function (e) {
    let value = $(this).val();
    let key = $(this).attr("id");
    if (key == "font-family") {
        $("#font-family").css(key, value);
    }
    if (!isNaN(value)) {
        value = parseInt(value);
    }

    $(".input-cell.selected").css(key, value);
    updateCellData(key, value);

})

function updateCellData(property, value) {
    if (value != defaultProperties[property]) {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = getRowCol(data);
            if (cellData[selectedSheet][rowId - 1] == undefined) {
                cellData[selectedSheet][rowId - 1] = {};
                cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties };
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
            }
            else {
                if (cellData[selectedSheet][rowId - 1][colId - 1] == undefined) {
                    cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties };
                }
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
            }
        })
    }
    else {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = getRowCol(data);
            if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]) {
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
                if (JSON.stringify(cellData[selectedSheet][rowId - 1][colId - 1]) == JSON.stringify(defaultProperties)) {
                    delete cellData[selectedSheet][rowId - 1][colId - 1];
                    if (Object.keys(cellData[selectedSheet][rowId - 1]).length == 0) {
                        delete cellData[selectedSheet][rowId - 1];
                    }
                }
            }
        })
    }
}

$(".container").click(function (e) {
    $(".sheet-options-modal").remove();
});

function addSheetEvents() {

    $(".sheet-tab.selected").on("contextmenu", function (e) {
        e.preventDefault();

        selectSheet(this);

        $(".sheet-options-modal").remove();
        let modal = $(`
            <div class="sheet-options-modal">
                <div class="option sheet-rename">Rename</div>
                <div class="option sheet-delete">Delete</div>
            </div>
        `);
        modal.css({ "left": e.pageX });
        $(".container").append(modal);

        $(".sheet-rename").click(function (e) {
            let renameModal = $(`
                <div class="sheet-modal-parent">
                    <div class="sheet-rename-modal">
                        <div class="sheet-modal-title">Rename Sheet</div>
                        <div class="sheet-modal-input-container">
                            <span class="sheet-modal-input-title">Rename Sheet to:</span>
                            <input class="sheet-modal-input" type="text" />
                        </div>
                        <div class="sheet-modal-confirmation">
                            <div class="button yes-button">OK</div>
                            <div class="button no-button">Cancel</div>
                        </div>
                    </div>
                </div>
            `)

            $(".container").append(renameModal);
            $(".sheet-modal-input").focus();
            $(".no-button").click(function () {
                $(".sheet-modal-parent").remove();
            })

            $(".yes-button").click(function (e) {
                renameSheet();
            });
            $(".sheet-modal-input").keypress(function (e) {
                if (e.key == "Enter") {
                    renameSheet();
                }
            })
        })

        $(".sheet-delete").click(function (e) {
            if(totalSheets>1){
                let deleteModal = $(`
                    <div class="sheet-modal-parent">
                        <div class="sheet-delete-modal">
                            <div class="sheet-modal-title">Sheet Name</div>
                            <div class="sheet-modal-detail-container">
                                <span class="sheet-modal-detail-title">Are you Sure?</span>
                            </div>
                            <div class="sheet-modal-confirmation">
                                <div class="button yes-button">Delete</div>
                                <div class="button no-button">Cancel</div>
                            </div>
                        </div>
                    </div>
                `)

                $(".container").append(deleteModal);
                $(".no-button").click(function () {
                    $(".sheet-modal-parent").remove();
                })

                $(".yes-button").click(function (e) {
                    deleteSheet();
                });
            }
            else{
                alert("Not possible");  
            }
        })

    })

    $(".sheet-tab.selected").click(function (e) {
        selectSheet(this);
    });
}

addSheetEvents();

$(".add-sheet").click(function (e) {
    lastlyAddedSheet++;
    totalSheets++;
    cellData[`Sheet${lastlyAddedSheet}`] = {};
    $(".sheet-tab.selected").removeClass("selected");
    $(".sheet-tab-container").append(`<div class="sheet-tab selected">Sheet${lastlyAddedSheet}</div>`);
    selectSheet();
    addSheetEvents();
})



function selectSheet(ele) {
    if (ele && !$(ele).hasClass("selected")) {
        $(".sheet-tab.selected").removeClass("selected");
        $(ele).addClass("selected");
    }
    emptyPreviousSheet();
    selectedSheet = $(".sheet-tab.selected").text();
    loadCurrentSheet();
    $(".sheet-tab.selected")[0].scrollIntoView();
    $("#row-1-col-1").click();
}

function emptyPreviousSheet() {
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(data[i]);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`);
            cell.text("");
            cell.css({
                "font-family": "NotoSans",
                "font-size": 14,
                "background-color": "#fff",
                "color": "#444",
                "font-weight": "",
                "font-style": "",
                "text-decoration": "",
                "text-align": "left"
            });
        }
    }
}

function loadCurrentSheet() {
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(data[i]);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`);
            cell.text(data[rowId][colId].text);
            cell.css({
                "font-family": data[rowId][colId]["font-family"],
                "font-size": data[rowId][colId]["font-size"],
                "background-color": data[rowId][colId]["bgcolor"],
                "color": data[rowId][colId].color,
                "font-weight": data[rowId][colId].bold ? "bold" : "",
                "font-style": data[rowId][colId].italic ? "italic" : "",
                "text-decoration": data[rowId][colId].underlined ? "underline" : "",
                "text-align": data[rowId][colId].alignment
            });
        }
    }
}

function renameSheet() {
    let newSheetName = $(".sheet-modal-input").val();
    if (newSheetName && !Object.keys(cellData).includes(newSheetName)) {
        let newCellData = {};
        for (let i of Object.keys(cellData)) {
            if (i == selectedSheet) {
                newCellData[newSheetName] = cellData[selectedSheet];
            }
            else {
                newCellData[i] = cellData[i];
            }
        }
        cellData = newCellData;
        delete newCellData;
        selectedSheet = newSheetName;
        $(".sheet-tab.selected").text(newSheetName);
        $(".sheet-modal-parent").remove();

    } else {
        $(".rename-error").remove();
        $(".sheet-modal-input-container").append(`
            <div class="rename-error"> Sheet Name is not valid or Sheet already exists! </div>
        `)
    }
}

function deleteSheet(){
    $(".sheet-modal-parent").remove();
    let sheetIndex=Object.keys(cellData).indexOf(selectedSheet);
    let currSelectedSheet = $(".sheet-tab.selected");
    if(sheetIndex==0){
        selectSheet(currSelectedSheet.next()[0]);
    }
    else{
        selectSheet(currSelectedSheet.prev()[0]);
    }
    delete cellData[currSelectedSheet.text()];
    currSelectedSheet.remove();
    totalSheets--;
}

$(".left-scroller,.right-scroller").click(function(e){
    let sheetIndex=Object.keys(cellData).indexOf(selectedSheet);
    if(sheetIndex!=0 && $(this).text()=="arrow_left"){
        selectSheet($(".sheet-tab.selected").prev()[0]);
    }
    else if(sheetIndex!=totalSheets-1 && $(this).text()=="arrow_right"){
        selectSheet($(".sheet-tab.selected").next()[0]);
    }
    $(".sheet-tab.selected")[0].scrollIntoView();
})


$("#menu-file").click(function(e){
    let fileModal=$(`
        <div class="file-modal">
            <div class="file-options-modal">
                <div class="file-option close">
                    <div class="material-icons close-icon">arrow_circle_down</div>
                    <div>Close</div>
                </div>
                <div class="file-option new">
                    <div class="material-icons new-icon">insert_drive_file</div>
                    <div>New</div>
                </div>
                <div class="file-option open">
                    <div class="material-icons open-icon">folder_open</div>
                    <div>Open</div>
                </div>
                <div class="file-option save">
                    <div class="material-icons save-icon">save</div>
                    <div>Save</div>
                </div>
            </div>
            <div class="file-recent-modal"></div>
            <div class="file-transparent"></div>
        </div>
    `)
    $(".container").append(fileModal);
    $(".file-modal").animate({
        width: "100vw"
    },300)


    $(".close,.file-transparent").click(function(e){
        $(".file-modal").animate({
            width: "0vw"
        },300)
        setTimeout(()=>{
            fileModal.remove();
        },300)
    })

    

})
