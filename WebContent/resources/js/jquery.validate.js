/*global $:false, jQuery:false */

(function($) {
    var btnSubmit = {};
    //tablica asocjacyjna przechowująca flagi czy dany validator zakonczony z sukcerem (1) czy z porazka (0); 
    var checkValidators = {};
    var isValid = function(validator, value) {
        checkValidators[validator] = value;
    };
    var isFormValid = function() {
        var valChecked = true;
        if ($.isEmptyObject(btnSubmit)) {
            return;
        }


        $.each(checkValidators, function(key, value) {
            if (value === 0) {
                valChecked = false;
                return false;
            }
        });

        if (valChecked) {
            btnSubmit.prop('disabled', false);
        }
    };

    $.fn.passwordValidator = function(ret) {
        return this.each(function() {
            var passwInfo = "hasło powinno zawierać od 4 do 30 znaków: a-Z, 0-9";
            isValid("passwordValidator", 0);

            $(this).on('change',
                function() {
                    var password = $(this).val();
                    if (checkPasswRegExp(password) === false) {
                        $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();
                        $(this).nextAll('[name="' + ret + '"]').eq(0).append(prepareOdp(passwInfo));
                        $(this).css("border-color", "red");
                        isValid("passwordValidator", 0);
                    } else {
                        var strength = passwordRate(entrophy(password), ownPasswordRate(password));
                        $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();
                        $(this).nextAll('[name="' + ret + '"]').eq(0).append(prepareOdp(strength));
                        $(this).css("border-color", "");
                        isValid("passwordValidator", 1);
                        isFormValid();
                    }
                }
            );

        });
    };

    $.fn.emailValidator = function(ret, regExp) {
        return this.each(function() {
            var settings = $.extend({
                r: "^[a-zA-Z0-9.]+@[a-zA-Z]+.[a-zA-Z]+$"
            }, regExp);

            var invalidEmail = "adres email niepoprawny";
            isValid("emailValidator", 0);

            $(this).on('change',
                function() {
                    var email = $(this).val();
                    if (checkRegExp(settings.r, email) === false) {
                        $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();
                        $(this).nextAll('[name="' + ret + '"]').eq(0).append(prepareOdp(invalidEmail));
                        $(this).css("border-color", "red");
                        isValid("emailValidator", 0);
                    } else {
                        $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();
                        $(this).css("border-color", "");
                        isValid("emailValidator", 1);
                        isFormValid();
                    }
                });
        });
    };

    $.fn.zipcodeValidator = function(ret, retCity) {
        return this.each(function() {
            var invalidZipcode = "kod pocztowy niepoprawny (poprawny format: 00-00)";
            var zipcodeRegExp = "^[0-9]{2}-[0-9]{3}$";
            isValid("zipcodeValidator", 0);

            $(this).on('change',
                function() {
                    var zipcode = $(this).val();

                    if (checkRegExp(zipcodeRegExp, zipcode) === false) {
                        $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();
                        $(this).nextAll('[name="' + ret + '"]').eq(0).append(prepareOdp(invalidZipcode));
                        $(this).css("border-color", "red");
                        isValid("zipcodeValidator", 0);
                    } else {
                        $(this).nextAll('[name="' + ret + '"]').eq(0).children().remove();
                        $(this).css("border-color", "");
                        isValid("zipcodeValidator", 1);
                        isFormValid();

                        //uzupełnij miasto
                        $.getJSON("./resources/data/zipcode.json", function(data) {
                            if ($(retCity).val().length === 0) {
                                $(retCity).val(data[zipcode].miejscowosc);
                            }
                        });
                    }
                });
        });
    };

    $.fn.formValidator = function() {
        return this.each(function() {
            $(this).prop('disabled', true);
            btnSubmit = $(this);
            $(this).css("color", "green");
        });
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

    for (var ind in password) {
        if (password.hasOwnProperty(ind)) {
            strength = strength + (pi * l);
        }
    }
    strength = -strength;

    if (strength <= (1 / 3) * maxStrength)
        return 0;
    if (strength > (1 / 3) * maxStrength && strength <= (2 / 3) * maxStrength)
        return 1;
    if (strength > (2 / 3) * maxStrength)
        return 2;
};

var ownPasswordRate = function(password) {
    var group_letters = {};
    var letter;
    var ind;
    var rate;
    var passwd = password;

    //zliczanie wystapien liter
    while (passwd.length !== 0) {
        letter = passwd.substring(0, 1);
        group_letters[letter] = 0;
        ind = 0;
        while (ind !== -1) {
            group_letters[letter]++;
            var s1 = passwd.substring(0, ind);
            var s2 = passwd.substring(ind + 1, passwd.length);
            passwd = s1.concat(s2);
            ind = passwd.indexOf(letter);
        }
    }

    rate = Object.keys(group_letters).length / password.length;

    if (rate <= (1 / 3))
        return 0;
    if (rate > (1 / 3) && rate <= (2 / 3))
        return 1;
    if (rate > (2 / 3))
        return 2;
};

var passwordRate = function(rate1, rate2) {
    console.log("r1:" + rate1 + " r2:" + rate2);
    var ret = "Siła hasła: ";

    switch (rate1 + rate2) {
        case 0:
        case 1:
            ret += "słaba";
            break;
        case 2:
        case 3:
            ret += "średnia";
            break;
        case 4:
            ret += "wysoka";
    }

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