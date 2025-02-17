async function fetchTransactionBalance(userId) {
    try {
        const response = await fetch(`${baseurl}/transactions/balance?accountnumber=${the_user.accountnumber}&status=ACTIVE`, {
            headers: {
                'Authorization': `Bearer ${the_token}`
            }
        });
        // if (!response.ok) {
        //     throw new Error('Failed to fetch transaction balance');
        // }
        const data = await response.json();
        if(data.message == "Expired Session") {
            window.location.href = 'sign-in';
        }
        return data.data.balance;
    } catch (error) {
        console.error('Error fetching transaction balance:', error);
        return null;
    }
}

fetchTransactionBalance(the_user.id).then(balance => {
    console.log('Transaction balance fetched.', balance);
    if (balance !== null) {
        console.log(`User's transaction balance: $${balance}`);
        document.querySelectorAll('[name="balanceval"]').forEach(element => {
            element.innerHTML = `${Number(balance).toLocaleString()} ${the_user.currency}`;
        });

        document.querySelectorAll('[name="currencyval"]').forEach(element => {
            element.innerHTML = the_user.currency;
        });
    } else {
        console.log('Could not retrieve transaction balance.');
    }
});
