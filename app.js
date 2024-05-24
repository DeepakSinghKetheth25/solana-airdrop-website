const SOLANA = require('@solana/web3.js');
const { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } = SOLANA;

const express = require('express')
const app = express()
const path = require('path')
const port = 3000

app.use(express.static('public'))
app.use(express.urlencoded());
app.use(express.json()); // This line is crucial for parsing JSON bodies sent via POST requests.


app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

/**
 * Purpose : Api to request solana airdrop from Solana devnet network
 */
app.post('/airdrop-solana', async (req, res) => {

    try {
        console.log('** airdrop solana request **')

        const recipientWalletAddressList = req.body.walletAddressList;
        const amount = parseInt(req.body.tokenQuantity);

        const AIRDROP_AMOUNT = amount * LAMPORTS_PER_SOL;
        const SOLANA_CONNECTION = new Connection(clusterApiUrl('devnet'));

        const txnHashMap = new Map();
        for (const walletAddress of recipientWalletAddressList) {

            try {
                console.log(`   - Requesting airdrop for ${walletAddress}`);

                //1. Request airdrop
                const signature = await SOLANA_CONNECTION.requestAirdrop(
                    new PublicKey(walletAddress),
                    AIRDROP_AMOUNT
                );

                //2. Fetch the blockhash
                const { blockhash, lastValidBlockHeight } = await SOLANA_CONNECTION.getLatestBlockhash();

                //3. Transaction Confirmation
                await SOLANA_CONNECTION.confirmTransaction({
                    blockhash,
                    lastValidBlockHeight,
                    signature
                }, 'finalized');

                txnHashMap.set(walletAddress, {
                    'success': true,
                    'signature': signature,
                });

            } catch (error) {
                console.log(`   - Error occurred while requesting airdrop for ${walletAddress}: ${error.message}`);
                const errorFirstPart = error.message.split(':')[0] + ':' ;
                txnHashMap.set(walletAddress, {
                    'success': false,
                    'error': errorFirstPart
                })
            }
        }

        let responseObj = {
            'success': true,
            'txnRecord': Object.fromEntries(txnHashMap)
        }

        console.log('Response:', responseObj);
        return res.json(responseObj);

    } catch (error) {
        console.log(` - Error occurred while processing airdrop :  ${error.message}`);
        const errorFirstPart = error.message.split(':')[0] + ':' ;
        res.status(500).json({
            'success': false,
            'error': errorFirstPart
        })
    }

})
