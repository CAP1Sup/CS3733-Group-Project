const mysql = require('mysql');
const db_access = require('/opt/nodejs/db_access')

exports.handler = async (event) => {

  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      host: db_access.config.host,
      user: db_access.config.user,
      password: db_access.config.password,
      database: db_access.config.database
  });

  let ValidateExists = (name) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Constants WHERE name=?", [name], (error, rows) => {
                if (error) { return reject(error); }
                console.log(rows)
                if ((rows) && (rows.length == 1)) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            });
        });
  }

  let response = undefined
  const can_create = await ValidateExists(event.name);

  if (!can_create) {
      let CreateConstant = (name, value) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT into Constants(name,value) VALUES(?,?);", [name,value], (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.affectedRows == 1)) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            });
        });
      }

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
