const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 280590,
    host: 'localhost',
    database: 'skatepark',
    port: 5432
});

async function nuevoSkater(email, nombre, password, anios_experiencia, especialidad, foto) {

    const result = await pool.query(`INSERT INTO skaters (email, nombre, password, anios_experiencia, especialidad, foto, estado) VALUES ('${email}', '${nombre}', '${password}', ${anios_experiencia}, '${especialidad}', '${foto}', false) RETURNING *`);
    const skater = result.rows[0];
    return skater;
}

async function getSkaters() {

    const result = await pool.query('SELECT * FROM skaters');
    return result.rows;
    
}

async function getSkater(email, pass) {

    const result = await pool.query(`SELECT * FROM skaters WHERE email = '${email}' AND password = '${pass}'`);
    return result.rows[0];
    
}

async function updateSkaterEstado(id, estado) {

    const result = await pool.query(`UPDATE skaters SET estado = ${estado} WHERE id = ${id} RETURNING *`);
    return result.rows[0];
}

async function updateSkater(id, nombre, password, anios_experiencia, especialidad) {

    const result = await pool.query(`UPDATE skaters SET nombre = '${nombre}', password = '${password}', anios_experiencia = ${anios_experiencia}, especialidad = '${especialidad}' WHERE id = ${id} RETURNING *`);
    return result.rows[0];
}

async function deleteSkater(id) {

    const result = await pool.query(`DELETE FROM skaters WHERE id = ${id}`);    
    return result.rowCount;
}

module.exports = {
    nuevoSkater,
    getSkaters,
    getSkater,
    updateSkaterEstado,
    updateSkater,
    deleteSkater
};