/* jshint strict:false */
(function($) {

    $.fn.passwordValidator = function(ret) {
        var passwInfo = "hasło powinno zawierać od 4 do 30 znaków: a-Z, 0-9";

        this.on('change',
            function() {
                var password = $(this).val();
                if (checkPasswRegExp(password) === false) {
                    $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();
                    $(this).nextAll('[name="' + ret + '"]').eq(0).append(prepareOdp(passwInfo));
                } else {
                    var strength = entrophy(password);
                    $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();
                    $(this).nextAll('[name="' + ret + '"]').eq(0).append(prepareOdp(strength));
                }

            }
        );

        return this;
    };

    $.fn.emailValidator = function(ret, regExp) {
        var settings = $.extend({
            r: "^[a-zA-Z0-9.]+@[a-zA-Z]+.[a-zA-Z]+$"
        }, regExp);

        var invalidEmail = "adres email niepoprawny";

        this.on('change',
            function() {
                var email = $(this).val();
                if (checkRegExp(settings.r, email) === false) {
                    $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();
                    $(this).nextAll('[name="' + ret + '"]').eq(0).append(prepareOdp(invalidEmail));
                } else {
                    $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();
                }
            });

        return this;
    };

    $.fn.zipcodeValidator = function(ret, retCity) {
        var invalidZipcode = "kod pocztowy niepoprawny (poprawny format: 00-00)";
        var zipcodeRegExp = "^[0-9]{2}-[0-9]{3}$";

        this.on('change',
            function() {
                var zipcode = $(this).val();

                if (checkRegExp(zipcodeRegExp, zipcode) === false) {
                    $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();
                    $(this).nextAll('[name="' + ret + '"]').eq(0).append(prepareOdp(invalidZipcode));
                } else {
                    $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();

                    //uzupełnij miasto
                    $.getJSON("./resources/data/zipcode.json", function(data) {
                        if($(retCity).val().length===0){
                         $(retCity).val(data[zipcode].miejscowosc);   
                        }
                    });
                };
            });

        return this;
    };

}(jQuery));

var prepareOdp = function(odp) {
    var txt2 = $("<span></span>").text(odp);
    return txt2;
};

var entrophy = function(password) {
    var numbOfChar = 26 + 26 + 10;
    var maxPasswLength = 30;
    var pi = 1 / numbOfChar;
    var l = Math.log2(pi);
    var maxStrength = -(maxPasswLength * l * pi);

    var strength = 0;
    var ret = "Siła hasła: ";


    for (var ind in password) {
        strength = strength + (pi * l);
    }
    strength = -strength;

    if (strength <= (1 / 3) * maxStrength)
        ret += "słaba";
    if (strength > (1 / 3) * maxStrength && strength <= (2 / 3) * maxStrength)
        ret += "średnia";
    if (strength > (2 / 3) * maxStrength)

        ret += "wysoka";

    return ret;
};

var checkPasswRegExp = function(password) {
    var passwRegExp = new RegExp("^[a-zA-Z0-9]{4,30}$");
    return passwRegExp.test(password);
};

var checkRegExp = function(regExp, string) {
    var stringRegExp = new RegExp(regExp);
    return stringRegExp.test(string);
};

/*
//wyszukiwanie kodu pocztowego z pliku metoda 2
$.ajax({
    url: './resources/data/convertcsv2.json',
    data: {
        type: 'json'
    },
    dataType: 'json',
    success: function(data) {
        if ($(retCity).val().length === 0) {
            $(retCity).val(data[zipcode].miejscowosc);
        }
    }
});
*/