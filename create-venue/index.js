const mysql = require('mysql');
const dbAccess = require('/opt/nodejs/dbAccess')

exports.handler = async (event) => {

  // Check to make sure that all values are present
  if (!event.name || !event.email || !event.passwd || !event.sections || !event.shows) {
    return {
      statusCode: 400,
      error: "Malformed request, missing parameters"
    }
  }

  // Check to make sure the email is valid (basically just check for @)
  if (!event.email.includes("@")) {
    return {
      statusCode: 400,
      error: "Not a valid email"
    }
  }

  // Check to make sure the password is valid (at least 8 characters)
  if (event.passwd.length < 8) {
    return {
      statusCode: 400,
      error: "Password must be at least 8 characters"
    }
  }

  // Check to make sure that the sections and valid
  if (event.sections.length != 3) {
    return {
      statusCode: 400,
      error: "There must be 3 sections"
    }
  }

  // Check to make sure that each of the sections has a valid name and sizing
  for (var i = 0; i < event.sections.length; i++) {
    if (!event.sections[i].name || !event.sections[i].rows || !event.sections[i].columns) {
      return {
        statusCode: 400,
        error: "Malformed request, missing parameter in section ${i + 1}"
      }
    }

    // Check that the rows and columns are valid
    if (event.sections[i].rows < 1 || event.sections[i].columns < 1) {
      return {
        statusCode: 400,
        error: "Rows and columns must be positive"
      }
    }
  }

  // Get credentials from the dbAccess layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      host: dbAccess.config.host,
      user: dbAccess.config.user,
      password: dbAccess.config.password,
      database: dbAccess.config.database
  });

  let createVenue = (name, email, passwd, sections, shows) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT into venues(name, managerEmail, managerPassword, sections, shows) VALUES(?,?,?,?,?)", [name, email, passwd, sections, shows], (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.affectedRows == 1)) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            });
        });
  }

  let response = undefined
  const createSuccessful = await createVenue(event.name, event.email, event.passwd, event.sections, event.shows);

  if (!can_create) {


      let add_result = await CreateConstant(event.name, event.value)
      response = {
        statusCode: 200,

        success: add_result
      }
  } else {
      response = {
        statusCode: 400,

        success: false
      };
  }

  pool.end();   // done with DB
  return response;
};
