import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Dynamically import 'imagemin' and plugins
const imagemin = await import('imagemin');
const imageminJpegtran = await import('imagemin-jpegtran');
const imageminPngquant = await import('imagemin-pngquant');

// Recursively create directory if it doesn't exist
function mkdirp(directory) {
    if (!fs.existsSync(directory)) {
        mkdirp(path.dirname(directory));
        fs.mkdirSync(directory);
    }
}

// Recursively process images in directory and subdirectories
async function processImages(srcDir, destDir) {
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) {
            // Recursively process this directory
            await processImages(srcPath, destPath);
        } else if (/\.(jpg|png|jpeg)$/i.test(entry.name)) {
            // Process image
            mkdirp(destDir);

            // Resize image
            await sharp(srcPath)
                .resize({ width: 500, withoutEnlargement: true })
                .toFile(destPath);

            // Minify image
            await imagemin.default([destPath], {
                destination: destDir,
                plugins: [
                    imageminJpegtran.default(),
                    imageminPngquant.default({ quality: [0.5, 0.6] })
                ]
            });
        }
    }
}

// Example usage
processImages('images', 'optimized-images').then(() => {
    console.log('All images processed');
});