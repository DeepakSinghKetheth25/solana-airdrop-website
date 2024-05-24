
function addAddress() {

    const walletAddress = document.getElementById('walletAddress').value;
    const addressList = document.getElementById('addressList');
    if (walletAddress) {
        addressList.value += walletAddress + '\n';
        document.getElementById('walletAddress').value = ''; // Clear input after adding
    }
}

function clearAddress() {
    document.getElementById('addressList').value = "";
}

function airdrop() {
    alert('Airdrop process initiated!');
}

function airdropSolana() {
    console.log('airdrop Solana');

    document.getElementById('popupModal').style.display = 'flex'; // Show popup
    document.getElementById('popupTitle').innerText = 'Processing...';
    document.getElementById('popupMessage').innerText = '';
    document.getElementById('spinner').style.display = 'block'; // Show spinner


    const walletaddressListString = document.querySelector('#addressList').value;
    let walletAddressList = [];
    if (walletaddressListString != '')
        walletAddressList = walletaddressListString.trim().split('\n');
    else {
        document.getElementById('popupModal').style.display = 'flex'; // Show popup
        document.getElementById('popupTitle').innerText = 'Wallet address is empty.';
        document.getElementById('popupMessage').innerText = '';
        return;
    }

    const tokenQuantity = document.querySelector('#tokenQuantity').value;
    console.log(tokenQuantity);

    console.log('sending request')
    fetch('/airdrop-solana', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ walletAddressList, tokenQuantity })
    }).then((response) => {
        return response.json();
    }).then((data) => {
        console.log('Response data' + data);

        document.getElementById('spinner').style.display = 'none'; // Hide spinner
        const recAddress = walletAddressList[0];

        console.log("Rec address : " + recAddress);

        if(data.success) {

            const success = data.txnRecord[recAddress].success;
            let popupMessage = '';
            let popupTitle = '';
            if(success) {
                popupTitle = 'Airdrop Successful';
                const signature = data.txnRecord[recAddress].signature;
                const displaySignature = signature.substring(0, 30) + '...   ';
                popupMessage = `<span>${displaySignature}</span><i id="copyIcon" class="fa-solid fa-clipboard" onclick="copySignature('${signature}')"></i>`;
            } else {
                popupTitle = 'Airdrop Failed';
                popupMessage = 'Error: ' + data.txnRecord[recAddress].error;
            }

            console.log(success + " : " + popupMessage);

            document.getElementById('popupTitle').innerText = popupTitle;
            document.getElementById('popupMessage').innerHTML = popupMessage;

        } else {
            document.getElementById('popupTitle').innerText = 'Airdrop Failed';
            document.getElementById('popupMessage').innerText = '';          
        }
        
    }).catch(error => {
        console.log("Error");
        document.getElementById('spinner').style.display = 'none'; // Hide spinner
        document.getElementById('popupTitle').innerText = 'Airdrop Failed';
        document.getElementById('popupMessage').innerText = '';
    })

}

function copySignature(signature) {
    console.log('Copy signature');
    navigator.clipboard.writeText(signature).then(() => {
        const copyIcon = document.getElementById('copyIcon');
        copyIcon.classList.remove('fa-clipboard');
        copyIcon.classList.add('fa-clipboard-check');
    });
}

function closePopup() {
    document.getElementById('popupModal').style.display = 'none'; // Hide popup
}