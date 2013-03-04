/*
 * JS for Profile generated by Tiggzi
 *
 * Created on: Sunday, March 03, 2013, 09:13:53 PM (PST)
 */
/************************************
 * JS API provided by Exadel Tiggzi  *
 ************************************/
/* Setting project environment indicator */
Tiggzi.env = "bundle";
Tiggzi.getProjectGUID = function() {
    return '5864b282-eb26-4d76-b066-bbd4a40a5194';
}
Tiggzi.getTargetPlatform = function() {
    return '0';
}

function navigateTo(outcome, useAjax) {
    Tiggzi.navigateTo(outcome, useAjax);
}

function adjustContentHeight() {
    Tiggzi.adjustContentHeight();
}

function adjustContentHeightWithPadding() {
    Tiggzi.adjustContentHeightWithPadding();
}

function setDetailContent(pageUrl) {
    Tiggzi.setDetailContent(pageUrl);
}
/**********************
 * SECURITY CONTEXTS  *
 **********************/
/*******************************
 *      SERVICE SETTINGS        *
 ********************************/
/*************************
 *      SERVICES          *
 *************************/
var CameraService = new Tiggr.CameraService({});
var PostGEO = new Tiggr.RestService({
    'url': 'http://10.100.26.245/updateprefs.php?userid={userid}&lat={lat}&longt={longt}',
    'dataType': 'json',
    'type': 'get',
    'echo': "{\"result\":\"success\"}"
});
var UpdatePrefs = new Tiggr.RestService({
    'url': 'http://ec2-50-112-223-94.us-west-2.compute.amazonaws.com/localtalk/updateprefs.php?topic={newtopic}&userid=1',
    'dataType': 'json',
    'type': 'get',
});
var Get2 = new Tiggr.RestService({
    'url': 'http://10.100.26.245/updateprefs.php?userid={userid}&topic={topic}',
    'dataType': 'json',
    'type': 'get',
    'echo': "{\r\n        \"result\": \"success\"\r\n}"
});
var RESTService = new Tiggr.RestService({
    'url': '',
    'dataType': 'json',
    'type': 'get',
});
var GET = new Tiggr.RestService({
    'url': 'http://10.100.31.228/launch/updateprefs.php?userid={userid}&topic={topic}',
    'dataType': 'jsonp',
    'type': 'get',
});
var UploadFile = new Tiggr.RestService({
    'url': 'http://ec2-50-112-223-94.us-west-2.compute.amazonaws.com/localtalk/uploadphoto.php',
    'dataType': 'json',
    'type': 'post',
    'contentType': 'application/x-www-form-urlencoded',
});
var GetInterestsById = new Tiggr.RestService({
    'url': 'http://ec2-50-112-223-94.us-west-2.compute.amazonaws.com/localtalk/getinterestsbyid.php?userid={userid}',
    'dataType': 'json',
    'type': 'get',
});
var GeolocationService = new Tiggr.GeolocationService({});
var UpdateLocation = new Tiggr.RestService({
    'url': 'http://ec2-50-112-223-94.us-west-2.compute.amazonaws.com/localtalk/updatelocation.php?lat={latitude}&longt={longt}&userid=1',
    'dataType': 'json',
    'type': 'get',
});
var GetUsersOnline = new Tiggr.RestService({
    'url': 'http://ec2-50-112-223-94.us-west-2.compute.amazonaws.com/localtalk/getusersonline.php',
    'dataType': 'json',
    'type': 'get',
});
var UserAuth = new Tiggr.RestService({
    'url': 'http://ec2-50-112-223-94.us-west-2.compute.amazonaws.com/localtalk/userauth.php?email={useremail}',
    'dataType': 'json',
    'type': 'get',
});
var contact = new Tiggr.RestService({
    'url': '',
    'dataType': 'json',
    'type': 'get',
});
createSpinner("files/resources/lib/jquerymobile/images/ajax-loader.gif");
Tiggzi.AppPages = [{
    "name": "Login",
    "location": "Login.html"
}, {
    "name": "Profile",
    "location": "Profile.html"
}, {
    "name": "Home",
    "location": "Home.html"
}, {
    "name": "ShowInterests",
    "location": "ShowInterests.html"
}, {
    "name": "startScreen",
    "location": "startScreen.html"
}];
j_25_js = function(runBeforeShow) { /* Object & array with components "name-to-id" mapping */
    var n2id_buf = {
        'mobilegrid_2': 'j_29',
        'mobilegridcell_3': 'j_30',
        'mobileimage_25': 'j_31',
        'mobilegridcell_4': 'j_32',
        'mobilebutton1_26': 'j_33',
        'mobilebutton1_36': 'j_34',
        'mobilelabel1_27': 'j_38',
        'mobilegrid_19': 'j_35',
        'mobilegridcell_20': 'j_36',
        'Topics': 'j_37',
        'mobilegrid_29': 'j_39',
        'mobilegridcell_30': 'j_40',
        'mobiletextinput1_28': 'j_41',
        'mobilegridcell_31': 'j_42',
        'mobilebutton1_35': 'j_43',
        'ShowUserID': 'j_44'
    };
    if ("n2id" in window && window.n2id !== undefined) {
        $.extend(n2id, n2id_buf);
    } else {
        window.n2id = n2id_buf;
    }
    Tiggr.CurrentScreen = 'j_25';
    /*************************
     * NONVISUAL COMPONENTS  *
     *************************/
    var datasources = [];
    mobilecamera1 = new Tiggr.DataSource(CameraService, {
        'onComplete': function(jqXHR, textStatus) {
            $t.refreshScreenFormElements("j_25");
        },
        'onSuccess': function(data) {},
        'onError': function(jqXHR, textStatus, errorThrown) {},
        'responseMapping': [{
            'PATH': ['imageDataBase64'],
            'ID': 'mobileimage_25',
            'ATTR': 'src'
        }, {
            'PATH': ['imageURI'],
            'ID': '___local_storage___',
            'ATTR': 'CurrentPhoto'
        }],
        'requestMapping': [{
            'PATH': ['quality'],
            'ATTR': '80'
        }, {
            'PATH': ['destinationType'],
            'ATTR': 'Data URL'
        }, {
            'PATH': ['sourcetype'],
            'ATTR': 'Photolibrary'
        }, {
            'PATH': ['allowedit'],
            'ATTR': 'true'
        }, {
            'PATH': ['encodingType'],
            'ATTR': 'JPEG'
        }, {
            'PATH': ['targetWidth'],
            'ATTR': '54'
        }, {
            'PATH': ['targetHeight'],
            'ATTR': '54'
        }]
    });
    datasources.push(mobilecamera1);
    restservice1 = new Tiggr.DataSource(Get2, {
        'onComplete': function(jqXHR, textStatus) {
            $t.refreshScreenFormElements("j_25");
        },
        'onSuccess': function(data) {},
        'onError': function(jqXHR, textStatus, errorThrown) {},
        'responseMapping': [],
        'requestMapping': [{
            'PATH': ['userid'],
            'ATTR': '1'
        }, {
            'PATH': ['topic'],
            'ID': 'mobiletextinput1_28',
            'ATTR': 'value'
        }]
    });
    datasources.push(restservice1);
    GetInterestsByIdService = new Tiggr.DataSource(GetInterestsById, {
        'onComplete': function(jqXHR, textStatus) {
            $t.refreshScreenFormElements("j_25");
        },
        'onSuccess': function(data) {},
        'onError': function(jqXHR, textStatus, errorThrown) {},
        'responseMapping': [{
            'PATH': ['$'],
            'ID': 'mobilegrid_19',
            'SET': [{
                'PATH': ['interestname'],
                'ID': 'Topics',
                'ATTR': '@'
            }]
        }],
        'requestMapping': [{
            'PATH': ['userid'],
            'ATTR': '1'
        }]
    });
    datasources.push(GetInterestsByIdService);
    UpdatePrefsService = new Tiggr.DataSource(UpdatePrefs, {
        'onComplete': function(jqXHR, textStatus) {
            $t.refreshScreenFormElements("j_25");
        },
        'onSuccess': function(data) {},
        'onError': function(jqXHR, textStatus, errorThrown) {},
        'responseMapping': [{
            'PATH': ['$'],
            'ID': 'mobilegrid_19',
            'SET': [{
                'PATH': ['interestname'],
                'ID': 'Topics',
                'ATTR': '@'
            }]
        }],
        'requestMapping': [{
            'PATH': ['newtopic'],
            'ID': 'mobiletextinput1_28',
            'ATTR': 'value'
        }]
    });
    datasources.push(UpdatePrefsService);
    Upload = new Tiggr.DataSource(UploadFile, {
        'onComplete': function(jqXHR, textStatus) {
            $t.refreshScreenFormElements("j_25");
        },
        'onSuccess': function(data) {},
        'onError': function(jqXHR, textStatus, errorThrown) {},
        'responseMapping': [],
        'requestMapping': [{
            'PATH': ['file'],
            'ID': 'mobileimage_25',
            'ATTR': 'src'
        }]
    });
    datasources.push(Upload);
    // Tiggzi Push-notification registration service
    /************************
     * EVENTS AND HANDLERS  *
     ************************/
    j_25_beforeshow = function() {
        Tiggzi.CurrentScreen = 'j_25';
        for (var idx = 0; idx < datasources.length; idx++) {
            datasources[idx].__setupDisplay();
        }
    }
    // screen onload
    screen_404D_onLoad = j_25_onLoad = function() {
        screen_404D_elementsExtraJS();
        setText('j_44', localStorage.getItem('userID'));
        try {
            GetInterestsByIdService.execute({})
        } catch (ex) {
            console.log(ex.name + '  ' + ex.message);
            hideSpinner();
        };
        setText('j_37', localStorage.getItem('curtopics'));
        j_25_windowEvents();
        screen_404D_elementsEvents();
    }
    // screen window events
    screen_404D_windowEvents = j_25_windowEvents = function() {
        $('#j_25').bind('pageshow orientationchange', function() {
            adjustContentHeightWithPadding();
        });
    }
    // screen elements extra js
    screen_404D_elementsExtraJS = j_25_elementsExtraJS = function() {
        // screen (screen-404D) extra code
    }
    // screen elements handler
    screen_404D_elementsEvents = j_25_elementsEvents = function() {
        $("a :input,a a,a fieldset label").live({
            click: function(event) {
                event.stopPropagation();
            }
        });
        $('#j_28 [name="mobilebutton1_26"]').die().live({
            click: function() {
                if (!$(this).attr('disabled')) {
                    try {
                        mobilecamera1.execute({})
                    } catch (ex) {
                        console.log(ex.name + '  ' + ex.message);
                        hideSpinner();
                    };
                }
            },
        });
        $('#j_28 [name="mobilebutton1_36"]').die().live({
            click: function() {
                if (!$(this).attr('disabled')) {
                    try {
                        Upload.execute({})
                    } catch (ex) {
                        console.log(ex.name + '  ' + ex.message);
                        hideSpinner();
                    };
                }
            },
        });
        $('#j_28 [name="mobilebutton1_35"]').die().live({
            click: function() {
                if (!$(this).attr('disabled')) {
                    try {
                        UpdatePrefsService.execute({})
                    } catch (ex) {
                        console.log(ex.name + '  ' + ex.message);
                        hideSpinner();
                    };
                }
            },
        });
    }
    $("#j_25").die("pagebeforeshow").live("pagebeforeshow", function(event, ui) {
        j_25_beforeshow();
    });
    if (runBeforeShow) {
        j_25_beforeshow();
    } else {
        j_25_onLoad();
    }
}
$("#j_25").die("pageinit").live("pageinit", function(event, ui) {
    Tiggzi.processSelectMenu($(this));
    j_25_js();
});