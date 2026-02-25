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

    const connection = await mysql.createConnection(url);

    try {
        console.log("Vérification de la structure de la table spots...");
        const [columns]: any = await connection.query("DESCRIBE spots;");
        console.log("Colonnes trouvées :");
        columns.forEach((col: any) => {
            console.log(`- ${col.Field}: ${col.Type}`);
        });

        console.log("\nVérification des derniers spots créés...");
        const [rows]: any = await connection.query("SELECT id, title, type, LEFT(image, 50) as imageHeader, LENGTH(image) as imageLength FROM spots ORDER BY id DESC LIMIT 5;");

        console.log("Données :");
        rows.forEach((row: any) => {
            console.log(`- ID: ${row.id}, Titre: ${row.title}, Type: ${row.type}, Image Header: ${row.imageHeader}..., Taille Image: ${row.imageLength} bytes`);
        });

    } catch (err) {
        console.error("Erreur :", err);
    } finally {
        await connection.end();
    }
}

run();
