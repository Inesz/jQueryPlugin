$(document).ready(function() {
    $('input[name="haslo"]').passwordValidator("info");
    //$('input[name="email"]').emailValidator("info", {r: "[a]{1}"} );
    $('input[name="email"]').emailValidator("info");
    
    $('input[name="kod_pocztowy"]').zipcodeValidator("info", 'input[name="miasto"]');
    $('input[type="submit"]').formValidator();
});