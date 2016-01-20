/* ***** Suitelet example script ***** */

/** exampleSL - an example Suitelet page
 * @param {nlobjRequest} nsRequest The web request
 * @param {nlobjResponse} nsResponse The response to be returned to the client
 */
function exampleSL(nsRequest, nsResponse) {
    // nsRequest.getMethod() determines if this is a GET or a POST operation
    // typically, GET is used to initially request the page
    // POST is used when submitting data from the user back to this script

    if (nsRequest.getMethod() == 'GET') {
        // first time GET page - render the form to the response object
        var form = renderSLForm();
        nsResponse.writePage(form);
    } else {
        // POST of form data - retrieve form values and decide what to do next
        var form = handlePOST(nsRequest);
        nsResponse.writePage(form);
    }
}

/** handlePOST - function to play with the data the user gave us, 
*    and return a form object to display results to the user
* @param {nlobjRequest} nsRequest The web request
* @returns {nlobjForm} the form object
*/
function handlePOST(nsRequest) {
    var form = nlapiCreateForm('My example Results');

    var rqParams = nsRequest.getAllParameters();

    // assume I have a scheduled script to call
    // var scriptStatus = nlapiScheduleScript('myscriptid', 'mydeployid', rqParams);
    // N.B. script parameters and rqParams probably have different names, so may actually need:
    var scriptParams = {
        custscript_param1 : rqParams['custpage_firstparam'],
        custscript_param2 : rqParams['custpage_anotherparam']
    };
    var scriptStatus = nlapiScheduleScript('myscriptid', 'mydeployid', scriptParams);
    // returns QUEUED, INQUEUE, INPROGRESS or SCHEDULED
    // QUEUED is good - our script has be scheduled for execution
    // anything else is bad:
    // SCHEDULED - the script is configured for scheduled execution so cannot be run on demand from here
    // INQUEUE - the script is already running once - we cannot queue it again until it finishes
    // QUEUED - the script is already queued - we cannot queue it again until it finishes or is cancelled
    
    s
    /*
    var selectedSubs = rqParams['custpage_subsidiary'];
    // selectedSubs = nsRequest.getParameter('custpage_subsidiary');
    var char5 = String.fromCharCode(5); // special multiselect value separator
    var subsList = selectedSubs.split(char5); // split into an array of values

    var fldResultText = form.addField('custpage_result', 'inlinehtml', 'Results');
    // fldResultText.setDefaultValue('You selected:<br>' + selectedSubs);
    var text = 'You selected subsidiary ids:<br>';
    for (var i = 0; i < subsList.length; ++i)
        text += subsList[i] + '<br>';
    fldResultText.setDefaultValue(text);
    */
    form = renderSLForm(rqParams);
//...
    return form;
}

/** renderSLForm - function to create the page objects and return a form
* @param {Array} params any page parameters, NULL for a GET operation
* @returns {nlobjForm} the form object
*/
function renderSLForm(params) {
    var form = nlapiCreateForm('My example suitelet');

    // form.addField( fieldId, fieldType, label, datasource )
    var fldSubsid = form.addField('custpage_subsidiary', 'multiselect', 'Subsidiary', 'subsidiary');
    fldSubsid.setHelpText('Select the subsidiary to use.');
    fldSubsid.setMandatory(true);
    fldSubsid.setDisplaySize(320, 10);

    var fldStartDate = form.addField('custpage_startdate', 'date', 'From Date');
    fldStartDate.setDefaultValue(nlapiDateToString(new Date()));
    var fldEndDate = form.addField('custpage_enddate', 'date', 'To Date');

    form.addSubmitButton();
    
    /* if I have params, set field default values */
    if (params) {
        if (params['custpage_subsidiary'])
            fldSubsid.setDefaultValue(params['custpage_subsidiary']);
        if (params['custpage_startdate'])
            fldStartDate.setDefaultValue(params['custpage_startdate']);
        if (params['custpage_enddate'])
            fldEndDate.setDefaultValue(params['custpage_enddate']);
    }

    return form;
}
