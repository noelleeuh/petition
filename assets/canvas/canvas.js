//Set a canvas with two-dimensional context//
const userCanvas = document.getElementById('sign');
const ctx = userCanvas.getContext('2d');
ctx.strokeStyle = "white";
//---//

//Main functions//
function drawSignature(x,y) {
    ctx.lineTo(x,y);
    ctx.stroke();
}

function moveMouse(e) {
    drawSignature(e.offsetX, e.offsetY);
}
//---//

//Start drawing//
userCanvas.addEventListener('mousedown', function(e) {
    ctx.moveTo(e.offsetX, e.offsetY);
    userCanvas.addEventListener('mousemove', moveMouse);
});
//---//

//Finish drawing//
userCanvas.addEventListener('mouseup', function(e) {
    userCanvas.removeEventListener('mousemove', moveMouse);
    var obtainSignature = userCanvas.toDataURL();
    document.querySelector('input[type="hidden"]').value = obtainSignature;
});
//---//
