let renameFunc = (_: string): void => {};
const modal = document.getElementById("renameModal") as HTMLDivElement;
const renameInput = document.getElementById("renameInput") as HTMLInputElement;

export function setRenameFunc(func: (name: string) => void) {
    renameFunc = func;
}

export function handleSubmit(event: SubmitEvent) {
    const form = event.target as HTMLFormElement;

    const newName = form.elements.namedItem("newTitle") as HTMLInputElement;
    renameFunc(newName.value);
    newName.value = "";
}

export function openRenameModal() {
    modal.hidden = false;
    renameInput.focus();
}

export function closeRenameModal() {
    modal.hidden = true;
}