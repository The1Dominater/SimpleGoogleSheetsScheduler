function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Scheduling")
    .addItem("Make schedule", "assignShifts")
    .addItem("Export schedule", "exportSchedule")
    .addToUi();
}

function assignShifts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange(); // Get all data in the sheet
  const values = range.getValues(); // Get cell values
  const backgrounds = range.getBackgrounds(); // Get cell background colors
  
  const personShifts = {};  // Track the number of shifts each person has worked
  const shiftAssignments = [["DATE", "DAY", "TIME", "Team Member On Duty"]]; // Header row

  // Loop through cells to modify values and assign shifts
  for (let row = 1; row < values.length; row++) { // Skip the header row
    const entry = values[row];
    const date = entry[0]; // Assuming the DATE is in the first column
    const shiftDay = entry[1]; // Assuming the SHIFT is in the second column
    const shiftTime = entry[2];
    const availablePeople = [];

    // Modify values based on background color and collect available people
    for (let col = 3; col < entry.length; col++) { // Assuming Person 1 starts from the 4th column
      if (backgrounds[row][col] === "#00ff00") { // Green background means available
        entry[col] = "_available_"; // Set the value to "_available_"
        sheet.getRange(row + 1, col + 1).setFontColor("#00ff00"); // Match font color to the background
        availablePeople.push(col); // Collect available person's name based on column
      }
    }

    // Ensure the person works only one shift per day
    let assignedPerson = null;
    if (availablePeople.length > 0) {
      // Select the person with the least number of shifts worked
      availablePeople.forEach(person => {
        if (!assignedPerson || (personShifts[person] || 0) < (personShifts[assignedPerson] || 0)) {
          assignedPerson = person;
        }
      });
    }

    if (assignedPerson) {
      // Assign the shift to the person
      shiftAssignments.push([date, shiftDay, shiftTime, values[0][assignedPerson]]);
      personShifts[assignedPerson] = (personShifts[assignedPerson] || 0) + 1;
    } else {
      // If no one is available, mark the shift as needing to be filled
      shiftAssignments.push([date, shiftDay, shiftTime, "FILL SHIFT"]);
    }
  }

  // Build the output sheet name
  const currentSheetName = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
  const assignmentSheetName = 'ScheduleFor' + currentSheetName;

  // Update the sheet with the assigned shifts
  var assignmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(assignmentSheetName);
  if (!assignmentSheet) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet(assignmentSheetName);
    assignmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(assignmentSheetName);
  }

  const updatedRange = assignmentSheet.getRange(1, 1, shiftAssignments.length, shiftAssignments[0].length);
  // Get the existing values in the range
  const existingValues = updatedRange.getValues();

  // Iterate through each cell and only update if the cell is empty
  for (let i = 0; i < shiftAssignments.length; i++) {
    for (let j = 0; j < shiftAssignments[i].length; j++) {
      if (!existingValues[i][j]) {  // Only set if the cell is empty
        existingValues[i][j] = shiftAssignments[i][j];
        if (shiftAssignments[i][j] === "FILL SHIFT") {
          assignmentSheet.getRange(i + 1, j + 1).setBackground('#ff0000');
        }
      }
    }
  }

  // Set the updated values back to the sheet
  updatedRange.setValues(existingValues);
}

function exportSchedule() {
  const assignmentSheet = SpreadsheetApp.getSheetByName('AssignedShifts');

  if (!assignmentSheet) {
    assignShifts();
  }

  const range = sheet.getDataRange(); // Get all data in the sheet
  const values = range.getValues(); // Get cell values

  // Convert the range to CSV format
  const csvContent = values.map(row => row.join(",")).join("\n");

  // Specify the folder for saving the CSV
  const folderId = "1c19WYOZKVe-fOj3BpsWr_lo0ZErub-6M"; // Replace with your folder ID
  const folder = DriveApp.getFolderById(folderId);

  // Get the current date in YYYY-MM-DD format
  const currentDate = new Date();
  const formattedDate = Utilities.formatDate(currentDate, Session.getScriptTimeZone(), "yyyy-MM-dd");

  // Create the CSV filename with the date appended
  const fileName = `schedule-${formattedDate}.csv`;

  // Create the CSV file in the specified folder with the new filename
  const blob = Utilities.newBlob(csvContent, "text/csv", fileName);
  folder.createFile(blob);

  // Prepare the folder link
  const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;

  // Create custom HTML with a clickable link and improved styling
  const htmlOutput = HtmlService.createHtmlOutput(
    `<div style="font-family: Arial, sans-serif; padding: 10px; width: auto; text-align: left; max-width: 500px;">
       <p style="margin: 0; font-size: 14px;">CSV file has been exported and saved to the folder. You can access it <a href="${folderUrl}" target="_blank" style="color: #1a73e8; text-decoration: none; font-weight: bold;">here</a></p>
     </div>`
  ).setHeight(50);  // Set the width of the modal dialog

  // Display the HTML in a dialog box
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Export Complete');
}

// For testing the functions
//assignShifts();
//exportSchedule()
