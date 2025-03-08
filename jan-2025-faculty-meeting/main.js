function adjustPadding() {
    const header = document.querySelector('header');
    const body = document.body;
    const headerHeight = header.offsetHeight;
    body.style.paddingTop = `${headerHeight + 20}px`; // Adding extra space if needed
}

window.addEventListener('load', adjustPadding);
window.addEventListener('resize', adjustPadding);
