const contactList = [];

// Attendre que le dispositif soit prêt
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    if (navigator.contacts) {
        try {
            var options = new ContactFindOptions();
            options.filter = "";
            options.multiple = true;
            var fields = ["name"];
            navigator.contacts.find(fields, onSuccess, onError, options);
        } catch (e) {
            alert(e);
        }
    } else {
        alert("Contacts API not available on this device.");
        console.log("Contacts API not available on this device.");
    }
}

function onSuccess(contacts) {
    const ul = $('#contactList');
    contactList.length = 0; // Réinitialiser contactList, mais pas l'UI
    for (let index = 0; index < contacts.length; index++) {
        const contact = contacts[index];
        contactList.push(contact);
        const id = contact.id;
        var li = `
            <li id="${id}" style="margin-top:20px; text-decoration: none; color: black;">
                <div style="display: flex; align-items: center;">
                    <img src="img/logo.png" style="width: 50px; height: 50px; margin-right: 20px">
                    <div style="display: flex; flex-direction: column; width:99%;">
                        <a href="#detailsPage" style="color:black" onClick="displayDetails(${id})">
                            <p style="color:black">${contact.name.formatted}</p>
                        </a>
                    </div>
                    <button style="color: black; border: none; padding: 5px 10px; border-radius: 5px; margin-right:5px;" onClick="editContactForm(${id})">Edit</button>
                    <button style="color: black; border: none; padding: 5px 10px; border-radius: 5px; margin-right:0%;" onClick="deleteContact(${id})">x</button>
                </div>
            </li>`;
        ul.append(li);
    }
}

function onError(error) {
    alert("Error retrieving contacts: " + error.code);
    console.log("Error retrieving contacts:", error);
}

function deleteContact(idContact) {
    const contact = contactList.find(contact => contact.id == idContact);
    contact.remove(successDelete, errorDelete);

    function successDelete() {
        contactList.splice(contactList.findIndex(contact => contact.id == idContact), 1);
        $(`li#${idContact}`).remove();
    }

    function errorDelete() {
        alert("Error deleting contact");
    }
}

function editContactForm(id) {
    const contact = contactList.find(contact => contact.id == id);
    $('#EditLastName').val(contact.name.familyName || '');
    $('#EditFirstName').val(contact.name.givenName || '');
    $('#Editphone').val(contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0].value : '');
    $('#EditEmail').val(contact.emails.length > 0 ? contact.emails[0].value : '');
    $('#EditContactId').val(id);
    $.mobile.changePage("#editContactPage", { transition: "slide", changeHash: false });
}

function editContact(event) {
    event.preventDefault();
    const id = $('#EditContactId').val();
    const contact = contactList.find(contact => contact.id == id);
    contact.name.familyName = $('#EditLastName').val();
    contact.name.givenName = $('#EditFirstName').val();
    contact.phoneNumbers[0].value = $('#Editphone').val();
    contact.emails = [new ContactField('work', $('#EditEmail').val(), true)];
    contact.name.formatted = $('#EditFirstName').val() + " " + $('#EditLastName').val();
    contact.save(successEdit, errorEdit);

    function successEdit(newContact) {
        const index = contactList.findIndex(contact => contact.id == id);
        contactList[index] = newContact;
        $(`li#${id}`).find('a').find('p').text(contact.name.formatted);
        $('#detailsPage').find('li:nth-child(1)').text(contact.name.formatted);
        $.mobile.changePage("#detailsPage", { transition: "slide", changeHash: false });
    }

    function errorEdit() {
        alert("Error editing contact");
    }
}

function displayDetails(id) {
    const contact = contactList.find(contact => contact.id == id);
    $('#detailsPage').find('li:nth-child(1)').attr('id', contact.id);
    $('#detailsPage').find('li:nth-child(1)').text(contact.name.formatted);
    $('#detailsPage').find('li:nth-child(2) a').html((contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0].value : ' '));
    $('#detailsPage').find('li:nth-child(3) a').text((contact.emails.length > 0 ? contact.emails[0].value : 'No email'));

    $('#EditLastName').val(contact.name.familyName || '');
    $('#EditFirstName').val(contact.name.givenName || '');
    $('#Editphone').val(contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0].value : '');
    $('#EditEmail').val(contact.emails.length > 0 ? contact.emails[0].value : '');
}

const addContact = () => {
    if ($('#lastName').val() && $('#firstName').val() && $('#phone').val()) {
        const contact = navigator.contacts.create();
        contact.displayName = $('#lastName').val();
        contact.nickname = $('#firstName').val();
        contact.name = new ContactName();
        contact.name.formatted = $('#firstName').val() + " " + $('#lastName').val();
        contact.name.givenName = $('#firstName').val();
        contact.name.familyName = $('#lastName').val();
        contact.phoneNumbers = [new ContactField('mobile', $('#phone').val(), true)];
        contact.emails = [new ContactField('work', $('#email').val(), true)];
        contact.save(onSuccess2, onError);
    } else {
        $.mobile.changePage("#homePage", { transition: "slide", changeHash: false });
    }
}

function onSuccess2(contact) {
    contactList.push(contact); // Ajouter le contact à la liste
    const ul = $('ul#contactList');
    var li = `
        <li id="${contact.id}" style="margin-top:20px; text-decoration: none; color: black;">
            <div style="display: flex; align-items: center;">
                <img src="img/logo.png" style="width: 50px; height: 50px; margin-right: 20px">
                <div style="display: flex; flex-direction: column;width:99%;">
                    <a href="#detailsPage" style="color:black" onClick="displayDetails(${contact.id})">
                        <p style="color:black">${contact.name.formatted}</p>
                    </a>
                </div>
                <button style="color: black; border: none; padding: 5px 10px; border-radius: 5px; margin-right:5px;" onClick="editContactForm(${contact.id})">Edit</button>
                <button style="color: black; border: none; padding: 5px 10px; border-radius: 5px; margin-right:0%;" onClick="deleteContact(${contact.id})">x</button>
            </div>
        </li>`;
    ul.append(li);
    ul.listview('refresh');
}
