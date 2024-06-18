// Get the current pathname and remove trailing slash to mimic default 
// mod_autoindex behavior
// If removing trailing slash would result in an empty string, return "/"
function getNormalizedPathname() {

    return (window.location.pathname.substring(0, window.location.pathname.length - 1) || "/");

}

// Get an array of directory names in the current path
function getdirectoryHierarchy() {

    let hierarchy = window.location.pathname.split("/");
    // Array begins and ends with empty string for whatever reason, 
    // the beginning one will be used but not the ending one
    hierarchy.pop();

    for (let i = 0; i < hierarchy.length; i++) {

        // Decode URI while we're at it
        hierarchy[i] = "/" + decodeURI(hierarchy[i]);

    }

    return hierarchy;

}

// Programmatically build navbar elements
function buildNavItems() {

    let ul = document.createElement("ul");

    let directoryHierarchy = getdirectoryHierarchy();
    for (let i = 0; i < directoryHierarchy.length; i++) {

        let li = document.createElement("li");

        let a = document.createElement("a");
        a.classList.add("pico-color-cyan-500");
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

        }
        li.appendChild(a);

        ul.appendChild(li);

    }

    $("nav").append(ul);

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

    $("table").remove();

    let newTable = document.createElement("table");

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

    newTable.classList.add("striped");

    $("main div").append(newTable);

}

// Mimic the default mod_autoindex behavior for title
document.title = "Index of " + getNormalizedPathname();

// Add body elements before showing body
$(document).ready(function () {

    buildNavItems();
    buildNewTable();

    $("body").show();

});