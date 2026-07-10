const { createClient } = require("@supabase/supabase-js");
const path = require("node:path");
const crypto = require("node:crypto");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.uploadFile = async (file, ownerId) => {
    const uuid = crypto.randomUUID();
    const filename = `${uuid}${path.extname(file.originalname)}`;

    const { data, error } = await supabase.storage
        .from('files')
        .upload(`${ownerId}/${filename}`, file.buffer, {
            contentType: file.mimetype
        });
    
    if (error) {
        console.error(error);
        return;
    }

    return data;
}

exports.downloadFile = async (filePath) => {
    const { data, error } = await supabase.storage
        .from('files')
        .download(filePath);

    if (error) {
        console.error(error);
        return;
    }

    return data;
}

exports.deleteFile = async (filePath) => {
    const { data, error } = await supabase.storage
        .from('files')
        .remove([filePath]);

    if (error) {
        console.error(error);
        return;
    }

    return data;
}