let allbanks
document.addEventListener('DOMContentLoaded', async function() {
    const bankSelect = document.getElementById('bank');

    try {
        const response = await fetch(`${baseurl}/bank/list?status=ACTIVE`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${the_token}`
            }
        });

        const res = await response.json();
        console.log('res', res)
        if(!res.status)return
        allbanks = res.data
        bankSelect.innerHTML = ''; // Clear existing options

        document.getElementById('bank').innerHTML = `<option selected disabled value="">-- SELECT BANK --</option>`
        const options = res.data.map(bank => {
            const option = document.createElement('option');
            option.value = bank.id;
            option.textContent = bank.bank;
            return option;
        });

        options.forEach(option => bankSelect.appendChild(option));
        new TomSelect('#bank', {
            plugins:['dropdown_input'],
            onChange: fetchRecipientName
        })
    } catch (error) {
        console.error('Error fetching banks:', error);
        bankSelect.innerHTML = '<option value="">Failed to load banks</option>';
    }


    const accountNumberInput = document.querySelector('input[name="accountNumber"]');
    const amountInput = document.querySelector('input[name="amount"]');
    const recipientNameInput = document.querySelector('input[name="recipientName"]');

    // Function to fetch recipient name
    async function fetchRecipientName() {
        console.log('the function is alled')
        const bankId = bankSelect.tomselect.getValue();
        const accountNumber = accountNumberInput.value;
        const amount = amountInput.value;

        if (bankId && accountNumber) {
            recipientNameInput.value = 'Loading...'
            try {
                const queryParams = new URLSearchParams({
                    bank: bankId,
                    accountnumber: accountNumber
                });

                const response = await fetch(`${baseurl}/bank/reciepients?${queryParams.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${the_token}`
                    }
                });

                const res = await response.json();
                if (res.status) {
                    recipientNameInput.value = res.data[0].fullname || 'Recipient Name...';
                } else {
                    console.error('Failed to fetch recipient name:', res.message);
                    recipientNameInput.value = 'Recipient Name...';
                }
            } catch (error) {
                console.error('Error fetching recipient name:', error);
                recipientNameInput.value = 'Recipient Name...';
            }
        } else {
            recipientNameInput.value = '';
        }
    }

    // Add event listeners
    // bankSelect.addEventListener('change', fetchRecipientName);
    accountNumberInput.addEventListener('change', fetchRecipientName);
    // amountInput.addEventListener('change', fetchRecipientName);

    document.getElementById('submittransfer').addEventListener('click', e => {
        e.preventDefault(); // Prevent form submission

        const bank = document.querySelector('select[name="bank"]').value;
        const accountNumber = accountNumberInput.value;
        const currency = document.querySelector('select[name="currency"]').value;
        const amount = amountInput.value;
        const recipientName = recipientNameInput.value;
        const description = document.querySelector('textarea[name="description"]').value;

        // Use SweetAlert to show transaction details for confirmation
        Swal.fire({
            title: `
                <div style="display: flex; align-items: center; justify-content: center; padding-bottom: 20px;">
                    <img src="assets/images/logo-with-text.png" alt="Logo" style="height: 40px; margin-right: 15px;">
                    <h3 style="color: #343a40; font-weight: 600; font-size: 26px; letter-spacing: 0.5px;">Transaction Confirmation</h3>
                </div>
            `,
            html: `
                <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; color: #333;">
                    <div style="border-bottom: 2px solid #e0e0e0; padding-bottom: 15px; margin-bottom: 20px;">
                        <h4 style="font-size: 20px; color: #495057; font-weight: 600;">Transaction Details</h4>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
                        <div style="flex: 1 1 48%; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                            <p style="margin: 0; color: #495057; font-weight: bold;">Bank:</p>
                            <p style="margin-top: 5px; color: #6c757d;">${allbanks.find(data => data.id == bank).bank}</p>
                        </div>
                        <div style="flex: 1 1 48%; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                            <p style="margin: 0; color: #495057; font-weight: bold;">Account Number:</p>
                            <p style="margin-top: 5px; color: #6c757d;">${accountNumber}</p>
                        </div>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
                        <div style="flex: 1 1 48%; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                            <p style="margin: 0; color: #495057; font-weight: bold;">Currency:</p>
                            <p style="margin-top: 5px; color: #6c757d;">${currency}</p>
                        </div>
                        <div style="flex: 1 1 48%; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                            <p style="margin: 0; color: #495057; font-weight: bold;">Amount:</p>
                            <p style="margin-top: 5px; color: #6c757d;">${amount}</p>
                        </div>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
                        <div style="flex: 1 1 48%; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                            <p style="margin: 0; color: #495057; font-weight: bold;">Recipient Name:</p>
                            <p style="margin-top: 5px; color: #6c757d;">${recipientName}</p>
                        </div>
                        <div style="flex: 1 1 48%; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                            <p style="margin: 0; color: #495057; font-weight: bold;">Description:</p>
                            <p style="margin-top: 5px; color: #6c757d;">${description}</p>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<span style="color: #fff; font-weight: bold;">Confirm</span>',
            cancelButtonText: '<span style="color: #fff; font-weight: bold;">Cancel</span>',
            customClass: {
                popup: 'swal2-custom-theme',
                confirmButton: 'swal2-confirm-button',
                cancelButton: 'swal2-cancel-button'
            },
            // buttonsStyling: false,
            showCloseButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true
        }).then(async (result) => {
            const pinStatus  = await getAndVerifyPin();
            if(!pinStatus)return
            const otpStatus = await getAndVerifyOTP()
            if(!otpStatus)return

            const bankName = allbanks.find(data => data.id == bank).bank

        const transactionData = {
            accountnumber: the_user.accountnumber,
            credit: 0,
            debit: amount,
            reference: "",
            transactiondate: new Date(),
            transactiondesc: `Transferred to ${recipientName} at ${bankName}, Account Number: ${accountNumber}`,
            currency,
            description,
            ttype: "DEBIT",
            tax: false,
            // createdby: 1,
            userid: the_user.id,
            tfrom: "CASH"
        };

        Swal.fire({
            title: 'Sending...',
            text: 'Please wait while we process your transaction.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        fetch(baseurl+'/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${the_token}` // Assuming authToken is defined and holds the authentication token
            },
            body: JSON.stringify(transactionData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Transaction data submitted:', data);
            Swal.close();
            if(data.status) {
                return Swal.fire({
                    title: 'Success!',
                    text: data.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    location.reload();
                });
            }
            if(!data.status)return Swal.fire({
                title: 'Failed!',
                text: data.message,
                icon: 'failed',
                confirmButtonText: 'OK'
            });
        })
        .catch(error => {
            console.error('Error submitting transaction:', error);
            Swal.close();
            Swal.fire({
                title: 'Error!',
                text: 'There was an error submitting your transaction.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });

    });

});
});
