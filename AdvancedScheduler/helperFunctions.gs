/** isSheetEmpty(sheet)
 * Helper function to check if the current sheet already contains data
 * and if it does offer to override, make a new sheet
 * or cancel the current operation
 * 
 * Input: sheet(SpreadsheetApp.Sheet) - a spread sheet obj
 * Output: SpreadsheetApp.Sheet or null
 */
function isSheetEmpty(sheet) {
  // Check if there is any data in the provided sheet
  if (sheet.getLastRow() === 0 && sheet.getLastColumn() === 0) {
    return true;
  }

  // If the sheet is not empty return false
  return false;
}

/** calculateDates(openingsTime, closingTime, shiftLength)
 * Helper function to parses date and time from the input string
 * format into a Date obj which can be used for doing calulations
 * 
 * Input: dateString(string) - date in the format "MM/DD/yyyy";
 *        timeString(string) - time in the format "hh:mm a";
 * Output: Date - a date obj
 **/
function calculateShiftDates(firstDay, lastDay) {
  const firstDate = parseDateTime(firstDay, "12:00AM");
  const lastDate = parseDateTime(lastDay, "12:00AM");

  if (firstDate > lastDate) {
    throw new Error("caclualteShifts: First day cannot be after last day");
  }

  let dates = [];
  let currentDate = new Date(firstDate); // Copy startDate to avoid modifying it

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate)); // Store a copy of the date
    currentDate.setDate(currentDate.getDate() + 1); // Increment by 1 day
  }

  return dates;
}

function convertToMilitary(timeString) {
  // Grab time values from time string
  var hour = parseInt(timeString.slice(0,2));
  const min = parseInt(timeString.slice(3,5));
  meridiem = timeString.slice(-2);

  // Convert to military time
  if (meridiem.toUpperCase().includes("PM")) {
    hour += 12;
  }
  else if (meridiem.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }

  // Return the time in 24-hour format as a floating point number
  return hour + min / 60;
}

function convertToStandard(time) {
  // Extract the integer hours and minutes
  let hours = Math.floor(time); // Get whole hours
  let minutes = Math.round((time - hours) * 60); // Convert decimal to minutes

  // Determine AM/PM
  let period = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12 || 12;

  // Format the time string with zero-padded minutes
  return hours + ":" + (minutes < 10 ? "0" : "") + minutes + " " + period;
}

/** calculateShifts(openingsTime, closingTime, shiftLength)
 * Helper function to parses date and time from the input string
 * format into a Date obj which can be used for doing calulations
 * 
 * Input: dateString(string) - date in the format "MM/DD/yyyy";
 *        timeString(string) - time in the format "hh:mm a";
 * Output: Date - a date obj
 **/
function calculateShiftTimes(openingTime, closingTime, shiftLength) {
  const open = convertToMilitary(openingTime);
  const close = convertToMilitary(closingTime);
  
  if (open > close) {
    throw new Error("caclualteShifts: closingTime occurs before openingTime");
  }

  const numShifts = (close - open)  / shiftLength;
  if (numShifts % 1 !== 0) {
    throw new Error("caclualteShifts: Hours open cannot properly be divided up  by shift lengths");
  }

  shiftTimes = [];
  for (let time = open; time < close; time+= shiftLength) {
    let shift = {
      start_time: convertToStandard(time),
      end_time: convertToStandard(time + shiftLength)
    }
    shiftTimes.push(shift);
  }

  return shiftTimes;
}

/** parseDateTime(dateString, timeString)
 * Helper function to parses date and time from the input string
 * format into a Date obj which can be used for doing calulations
 * 
 * Input: dateString(string) - date in the format "MM/DD/yyyy";
 *        timeString(string) - time in the format "hh:mm a";
 * Output: Date - a date obj
 **/
function parseDateTime(dateString, timeString) {
  // Grab date values from date string
  const dateArray = dateString.split("/");
  if (dateArray.length != 3) {
    throw new Error("parseDateTime: Cannot parse a date without month,day, and year.");
  }
  const month = parseInt(dateArray[0]) - 1; // Get month index
  const day = parseInt(dateArray[1]);
  const year = parseInt(dateArray[2]);

  // Grab time values from time string
  var hour = parseInt(timeString.slice(0,2));
  const min = parseInt(timeString.slice(3,5));
  meridiem = timeString.slice(-2);
  if (meridiem.toUpperCase().includes("PM")) {
    hour = hour + 12;
  }
  else if (meridiem.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }
  
  // Return input date and time as a Date obj
  return new Date(year,month,day,hour,min);
}

/** areShiftsOnSameDay(endFirst, startSecond)
 * Helper function to determine if shifts occur on the same day back-to-back to
 * prevent staff member's from having large holes in their schedule
 * 
 * Input: endFirst(Date) - date obj describing date and time the first shift ends;
 *        startSecond(Date) - date obj describing date and time the second shift starts;
 * Output: boolean - if shifts within 24hrs of each other return true; otherwise false
 **/
function areShiftsOnSameDay(endFirst, startSecond) {
   // Set the maximum time(hrs) between shifts to be considered consecutive
  const MAX_TIME_DIFF = 24.0;

  // Check if the second shift occurred after the first shift
  if (startSecond > endFirst) {
    // Calculate difference between first shifts end and seconds start
    const diffHours = (startSecond - endFirst) / (3600000);

    // Check if to be same day
    if (diffHours <= MAX_TIME_DIFF) {
      return true;
    }
  }

  // If shifts are not on the same day return false
  return false;
}

/** areShiftsConsecutive(endFirst, startSecond)
 * Helper function to determine if shifts occur back-to-back to
 * prevent staff member's from having large holes in their schedule
 * 
 * Input: endFirst(Date) - date obj describing date and time the first shift ends;
 *        startSecond(Date) - date obj describing date and time the second shift starts;
 * Output: boolean - if shifts are consecutive return true; otherwise false
 **/
function areShiftsConsecutive(endFirst, startSecond) {
   // Set the maximum time(hrs) between shifts to be considered consecutive
  const MAX_TIME_DIFF = 1.0;

  // Check if the second shift occurred after the first shift
  if (startSecond > endFirst) {
    // Calculate difference between first shifts end and seconds start
    const diffHours = (startSecond - endFirst) / (3600000);

    // Check if the difference is considered to be consecutive
    if (diffHours <= MAX_TIME_DIFF) {
      return true;
    }
  }

  // If shifts are not consecutive return false
  return false;
}

 /** exceedsMaxShiftTime(startTime,endTime)
 * Helper function to determine if shifts would exceed
 * maximum allowed working hours if combined.
 * 
 * Input: startFirst(Date) - date obj describing date and time the first shift starts;
 *        endSecond(Date) - date obj describing date and time the second shift ends;
 * Output: boolean - if shifts combined time exceeds the maximum allow time return true; otherwise false
 **/
function exceedsMaxShiftTime(firstStartTime,firstEndTime, secondStartTime, secondEndTime) {
  // Caluculate total combined shift times
  const firstShiftTotal = (firstEndTime - firstStartTime) / (3600000); // Converts from ms to hrs
  const secondShiftTotal = (secondEndTime - secondStartTime) / (3600000); 
  const totalTime = firstShiftTotal + secondShiftTotal;

  // Check if the total time exceeds the maximum time allowed
  if (totalTime > MAX_SHIFT_TIME) {
    return true;
  }

  // If combined shift time does not exceed maximum shift time return false
  return false;
}
