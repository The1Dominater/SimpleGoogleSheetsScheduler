

/** 
 * Scheduler function(greedy)
 */
function assignShifts(staff, shiftData, assignmentSheet) {
  const startingRow = 2;
  for (let shift = startingRow; shift < shiftData.length + startingRow; shift++) {
    let staffNeeded = shiftData[shift - startingRow][staffNeededIndex];

    // Find a staffMember that is available and not maxed out
    for (const staffMember of staff) {
      // Find staffMember if staff is still needed
      if (staffNeeded > 0) {
        if (staffMember.isAvailable(shift)) {
          // Color in the staffer's assigned shift
          let col = numShiftInfoLabels + 1 + staff.indexOf(staffMember);
          assignmentSheet.getRange(shift, col).setBackground("#00ff00");
          // Adjust the current employee's availability
          staffMember.assignShift(shift, shiftData);
          // Adjust the current shift requirements
          staffNeeded--;
        }
      }
      else {
        break;
      }
    }

    // If no one was available for a given shift indicate it
    if (staffNeeded > 0) {
      let shiftRange = assignmentSheet.getRange(shift,1,1,numShiftInfoLabels);
      shiftRange.setBackground("#ffff00");
      shiftRange.setFontWeight("bold");
    }
  }
}

/**
 * The generateShiftAssignments() reads a table of employees'
 * availability. It considers anything marked with 
 * green available and everything else
 * non-available.
 *
 * Input: Table - color coded table of employee availability
 * Output: Table - schedule connecting each shift to an employee 
 **/
function generateShiftAssignments() {
  const sheet = spreadsheet.getActiveSheet();
  const assignmentSheet = generateAssignmentSheet(sheet);

  // Setup acceptable green inputs
  const greenRanges = [
    "#00FF00", "#00ff00", // pure green
    "#008000", // dark green
    "#00FF7F", "#00ff7f", // spring green
    "#ADFF2F", "#adff2f", // green yellow
    "#32CD32", "#32cd32", // lime green
    "#228B22", "#228b22",// forest green
    "#7CFC00", "#7cfc00", // lawn green
    "#98FB98", "#98fb98", // pale green
    "#90EE90", "#90ee90" // light green
  ];

  const staff = [];
  const firstStaff = numShiftInfoLabels + 1;
  const lastStaff = firstStaff + staffNames.length
  for (let col = firstStaff; col < lastStaff; col++) {
    const staffName = sheet.getRange(2, col).getValue();
    // Get their desire number of shifts
    const desiredNumShifts = sheet.getRange(3, col).getValue();

    // Get their availability
    const availableShifts = [];
    for (let row = numHeaderRows + 1; row <= sheet.getLastRow(); row++) {
      const cellColor = sheet.getRange(row, col).getBackground();
      if (greenRanges.includes(cellColor)) {
        availableShifts.push(row - numHeaderRows + 1);
      }
    }

    // Add staff member to the staff
    const staffMember = new StaffMember(staffName, desiredNumShifts, availableShifts);
    staff.push(staffMember);
  }

  // Assign shifts
  const shiftData = sheet.getRange((numHeaderRows + 1),1,(sheet.getLastRow() - numHeaderRows),numShiftInfoLabels).getValues();
  assignShifts(staff, shiftData, assignmentSheet);
}
