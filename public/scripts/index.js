const addFileDropbox = document.querySelector("form[action='/add-file'] .dropbox");
const addFileInput = document.querySelector("form[action='/add-file'] .dropbox > #file");

// handle file input
if (addFileDropbox && addFileInput) {
    const currentFileList = [];

    function validateCurrentFileList() {
        const errorField = document.querySelector("form[action='/add-file'] > .input > .field-error");
        let foundError = false;

        // verification
        
        if (foundError) return;

        errorField.textContent = "";
    }

    function displayCurrentFileList() {
        const fileContainer = addFileDropbox.querySelector(".file-container");
        fileContainer.textContent = "";
        
        currentFileList.forEach((f, idx) => {
            const file = document.createElement("div");
            file.classList.add("file-item", "flex");

            const name = document.createElement("span");
            name.textContent = f.name;
            file.appendChild(name);

            const removeButton = document.createElement("button");
            removeButton.textContent = "x";
            removeButton.addEventListener("click", (e) => {
                e.stopPropagation();
                currentFileList.splice(idx, 1);
                file.remove();

                validateCurrentFileList();
                displayCurrentFileList();
            });
            file.appendChild(removeButton);

            fileContainer.appendChild(file);
        });
    }

    function handleFileInput(files) {
        for (let i = 0; i < files.length; i++) {
            currentFileList.push(files[i]);
        }

        validateCurrentFileList();
        displayCurrentFileList();
    }

    function dragenter(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    function dragover(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    function drop(e) {
        e.stopPropagation();
        e.preventDefault();

        const dt = e.dataTransfer;
        const files = dt.files;

        handleFileInput(files);
    }

    addFileDropbox.addEventListener("click", e => {
        if (addFileInput) addFileInput.click();
    });

    addFileDropbox.addEventListener("dragenter", dragenter);
    addFileDropbox.addEventListener("dragover", dragover);
    addFileDropbox.addEventListener("drop", drop);

    addFileInput.addEventListener("input", (e) => {
        e.preventDefault();

        const files = e.target.files;

        handleFileInput(files);
    });

    const form = document.querySelector("form[action='/add-file']");
    form.addEventListener("submit", (e) => {
        const errorField = document.querySelector("form[action='/add-file'] > .input > .field-error");
        if (errorField.textContent !== "") {
            e.preventDefault();
            return;
        }

        const dataTransfer = new DataTransfer();
        currentFileList.forEach(file => dataTransfer.items.add(file));
        addFileInput.files = dataTransfer.files;
    });
}