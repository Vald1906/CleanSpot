import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("DATABASE_URL non trouvée dans .env");
        process.exit(1);
    }

    console.log("Connexion à la base de données...");
    const connection = await mysql.createConnection(url);

    try {
        console.log("Conversion de la colonne image en LONGTEXT...");
        await connection.query("ALTER TABLE spots MODIFY COLUMN image LONGTEXT;");
        console.log("Colonne image convertie avec succès !");

        console.log("Vérification...");
        const [columns]: any = await connection.query("DESCRIBE spots;");
        const imageCol = columns.find((col: any) => col.Field === 'image');
        console.log(`- image: ${imageCol.Type}`);

    } catch (err) {
        console.error("Erreur lors de la migration :", err);
    } finally {
        await connection.end();
    }
}

run();
