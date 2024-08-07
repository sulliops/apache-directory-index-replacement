// Get an array of directory names in the current path
function getdirectoryHierarchy() {

    let hierarchy = document.title.replace("Index of ", "").split("/");
    // When the current directory is top-level and not aliased, an 
    // extra empty string appears in the array
    if (document.title === "Index of /") {

        hierarchy.pop();

    }

    for (let i = 0; i < hierarchy.length; i++) {

        // Decode URI while we're at it
        hierarchy[i] = "/" + decodeURI(hierarchy[i]);

    }

    return hierarchy;

}

// Programmatically build navigation elements
function buildNavItems() {

    let p = document.createElement("p");
    p.classList.add("navbar-custom");

    let directoryHierarchy = getdirectoryHierarchy();
    for (let i = 0; i < directoryHierarchy.length; i++) {

        let a = document.createElement("a");
        a.classList.add("pico-color-cyan-500");
        a.classList.add("nav-item-custom");
        // Last breadcrumb link should self-reference
        if (i + 1 === directoryHierarchy.length) {

            a.href = "#";

        } else {

            // Copy the array so we can pop elements properly
            let customHierarchy = [...directoryHierarchy];
            // There's probably a better way to do this but whatever
            for (let j = directoryHierarchy.length - 1; j >= i + 1; j--) {

                customHierarchy.pop();

            }

            // First breadcrumb link should reference the "root" 
            // directory
            // This only works properly if the root path of the 
            // hostname is the actual root of the WebDAV directory
            if (i === 0) {

                a.href = "/";

                // All remaining breadcrumb links follow directory 
                // hierarchy
            } else {

                a.href = customHierarchy.join("").substring(1);

            }

        }
        // Add a bit of text to the root directory breadcrumb so it 
        // doesn't look so out of place when you're viewing the 
        // root directory
        if (i === 0) {

            a.innerHTML = directoryHierarchy[i] + " (root)";

        } else {

            a.innerHTML = directoryHierarchy[i];

            p.innerHTML += " > ";

        }
        
        p.appendChild(a);

    }

    $("#nav-loading").replaceWith(p);

}

// Parses HTML table built by mod_autoindex into a normalized JSON 
// object
// This shouldn't be necessary, but the devs behind mod_autoindex 
// apparently thought following standard HTML table structure 
// wasn't necessary either
function parseTableToJSON() {

    let table = {};

    $("table tr").each(function (i, tr) {

        let row = [];

        if (i === 0) {

            $("th", tr).each(function (j, th) {

                row.push($(th).html());

            });

            table["thead"] = row;
            table["tbody"] = [];

        } else {

            $("td", tr).each(function (j, td) {

                row.push($(td).html());

            });

            table["tbody"].push(row);

        }

    });

    // For some reason, the mod_autoindex table has some completely 
    // empty rows
    table["tbody"] = table["tbody"].filter(val => Object.keys(val).length !== 0);

    return table;

}

// Builds Pico CSS table from existing mod_autoindex table
// Removes existing table
function buildNewTable() {

    let originalTable = parseTableToJSON();

    $("#original-table-wrapper").remove();

    let newTable = document.createElement("table");
    newTable.classList.add("striped");

    let tr = document.createElement("tr");
    for (let i = 0; i < originalTable["thead"].length; i++) {

        let th = document.createElement("th");
        th.scope = "col";
        // Add heading text for icon row to fix a weird issue with 
        // icons not displaying when a file name is beyond a 
        // certain number of characters
        if (i === 0) {

            th.innerHTML = "Icon";

        } else {

            th.innerHTML = originalTable["thead"][i];

        }

        tr.appendChild(th);

    }
    let tableHeader = document.createElement("thead");
    tableHeader.appendChild(tr);
    newTable.appendChild(tableHeader);

    let tableBody = document.createElement("tbody");
    for (let i = 0; i < originalTable["tbody"].length; i++) {

        tr = document.createElement("tr");
        for (let j = 0; j < originalTable["tbody"][i].length; j++) {

            if (j === 0) {

                let th = document.createElement("th");
                th.scope = "row";
                th.innerHTML = originalTable["tbody"][i][j];

                tr.appendChild(th);

            } else {

                let td = document.createElement("td");
                td.innerHTML = originalTable["tbody"][i][j];

                tr.appendChild(td);

            }

        }

        tableBody.appendChild(tr);

    }
    newTable.appendChild(tableBody);

    // Fade out table loading placeholder and replace with new table
    $(newTable).hide();
    $("#table-loading").fadeOut("slow", function() {

        $(this).replaceWith(newTable);
        $(newTable).fadeIn("slow");

    });

}

// Set HTML theme
$("html").attr("data-theme", "light");

// Add body elements before showing body
$(document).ready(function () {

    buildNavItems();
    buildNewTable();

});