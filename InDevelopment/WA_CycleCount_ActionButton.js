/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Apr 2016     SCD
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
		
	//	var sUrl = nlapiResolveURL('SUITELET', 'customscript_wag_cyclecount_list', 'customdeploy_wag_cyclecountlisting');
	//	sUrl = sUrl + '&recordid=' + nlapiGetRecordId() +'&record=' + nlapiGetRecordType();
		
	//	form.addButton('custpage_btn_print', 'Export to CSV', 'window.open(\'' + sUrl + '\', \'_blank\' )');

		var sUrl2 = nlapiResolveURL('SUITELET', 'customscript_wag_cyclecountexp_xml', 'customdeploy_wag_cyclecountexp_xml');
		sUrl2 = sUrl2 + '&recordid=' + nlapiGetRecordId() +'&record=' + nlapiGetRecordType();
		
		form.addButton('custpage_btn_printxml', 'Export to Excel', 'window.open(\'' + sUrl2 + '\', \'_blank\' )');		

			
}