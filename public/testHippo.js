//Moved testHippo.js here to handle logic and js code for frontend 

async function generateNewBlock(strAmount, strSender, strRecipient) {
    try {
      const objResponse = await fetch("/generateBlock", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: strAmount,
          sender: strSender,
          recipient: strRecipient
        })
      });
  
      const data = await objResponse.json();
      console.log("Block generated:", data);
      const displayData = JSON.stringify(data.block, null, 2)
      document.querySelector('#lastBlock').textContent = displayData
      document.querySelector('#lastBlock').style.display = 'block'
      document.querySelector('#labelLastBlock').style.display = 'block'
  
    } catch (err) {
      console.error("Error generating block:", err);
    }
  }

async function viewChain() {
    try {
        const objResponse = await fetch("/viewChain", {
            method: 'GET'
        })

        const data = await objResponse.json();
        console.log("Chain data recieved", data)
        const displayData = JSON.stringify(data.chain, null, 2)
        document.querySelector('#viewChain').textContent = displayData
        document.querySelector('#viewChain').style.display = 'block'
        document.querySelector('#labelViewChain').style.display = 'block'

    } catch (err) {
        console.error("Error getting chain data", err)
    }
}



document.querySelector("#btnNewBlock").addEventListener("click", () => {
    const strAmount = document.querySelector('#txtTransactionAmount').value
    const strSender = document.querySelector('#txtSender').value
    const strRecipient = document.querySelector('#txtRecipient').value

    let blnError = false
    let strErrorMessage = ''

    if(strAmount.length < 1 || strSender.length < 1 || strRecipient < 1) {
        blnError = true
        strErrorMessage += `<p>You cannot generate a block with empty fields.<p/>`
    }

    if(blnError == true) {
        Swal.fire({
            title: "Oh no, you have an error!",
            html: strErrorMessage,
            icon: "error"
        });

    }

    if(blnError == true) {
        Swal.fire({
            title: "Oh no, you have an error!",
            html: strErrorMessage,
            icon: "error"
        });

    }
    
    if(blnError == false) {
        Swal.fire({
            title: "Block Generated!",
            html: strErrorMessage,
            icon: "success"
        });
        generateNewBlock(strAmount, strSender, strRecipient);

    }
});

document.querySelector('#btnViewChain').addEventListener("click", () => {
    viewChain();
})