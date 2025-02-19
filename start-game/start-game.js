function openInstructions() {
    document.getElementById("instructions-modal").style.display = "flex";
  }
  
  function closeInstructions() {
    document.getElementById("instructions-modal").style.display = "none";
  }
  
  window.onclick = function (event) {
    const modal = document.getElementById("instructions-modal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };