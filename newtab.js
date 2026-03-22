const chance = Math.random();
console.log("loading new tab ...", chance)
if (chance<0.10){
    window.location= "https://kiranze.github.io/JesseGudge/Index.html";
} else {
    window.location.href = "https://www.google.com";
}
