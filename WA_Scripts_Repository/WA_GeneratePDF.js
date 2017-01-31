/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jan 2017     david.andre
 *
 */

/**
 * Global Variables
 */
	var subsidiary = null;
	var company = null;
	var baseurl = null;
	var labels = null;
	var native = null;

	
/**
 * Add dynamic button to page to Generate PDFs
 *  
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function addButtonDunningLetter(type, form, request){
		
		var sUrl2 = nlapiResolveURL('SUITELET', 'customscript_wag_printDunningL_1', 'customdeploy_wag_printDunningL_1');
		sUrl2 = sUrl2 + '&recordid=' + nlapiGetRecordId() +'&record=' + nlapiGetRecordType();
		
		form.addButton('custpage_btn_dunningletter1', 'Dunning Letter 1 ', 'window.open(\'' + sUrl2 + '\', \'_blank\' )');		

			
}
	
	
	
/**
 *  Generate Dunning Letter Level 1
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function genWADunningLetter1(request, response){

	var pdftxt = null;
	var pdffile = null;
	
	try {
	
		subsidiary = nlapiLoadRecord('subsidiary', nlapiGetSubsidiary());
		company = nlapiLoadConfiguration('companyinformation');
		baseurl = company.getFieldValue('custrecord_wag_baseurl');
	
		// use English or local language
		native = 1;
		
		nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Call GenLabels');
		genLabels();
			
		nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Start Envelop');
		pdftext  = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
		pdftext += '<pdf>\n<head>\n<macrolist>\n';
		nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Call GenWAHeader');
		pdftext += genWAHeader(request);
		nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Call GenWAFooter');
		pdftext += genWAFooter(request);
		pdftext += '</macrolist>\n';
		pdftext += genStyles();			
		pdftext += '</head>\n';
		pdftext += '<body header=\"nlheaderWA\" header-height=\"2in\" footer=\"nlfooterWA\" footer-height=\"2.5in\" padding=\"0.5in 0.5in 0.25in 0.5in\" size=\"A4\" ';
		pdftext += ' background-image=\"' + nlapiEscapeXML(company.getFieldValue('custrecord_wag_wa_header_strip_url'));
		pdftext += '\" background-position=\"left top\" background-image-width=\"8.27in\" background-image-height=\"0.5in\" >\n';
	
		nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Call GenBody');
		pdftext += genBodyDunningLetter1(request);
		
		pdftext +='</body>\n</pdf>\n';
			
		nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Prepare response : '+ pdftext);
		pdffile = nlapiXMLToPDF(pdftext);
		nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'File size: '+ pdffile.getSize());
		nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'File type : '+ pdffile.getType());
		
		
		// set content type, file name, and content-disposition (inline means display in browser)
		nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Set Content Type');		
		response.setContentType('PDF','dunning_letter1.pdf');
	
		// write response to the client
		nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Write Response');		
		response.write( pdffile.getValue() );
	
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() )
	}
	
}

function genStyles() {
	
	var styles = null;
	
	styles = "<style type=\"text/css\">\n";
	styles += 'table {\n';
	styles += 'font-family: sans-serif;\n';
	styles += 'font-size: 9pt;\n';
	styles += 'table-layout: fixed;\n';
	styles += '}\n';
	styles += 'th {\n';
	styles += 'font-weight: bold;\n';
	styles += 'font-size: 8pt;\n';
	styles += 'vertical-align: middle;\n';
	styles += 'padding: 5px 6px 3px;\n';
	styles += 'background-color: \#e3e3e3;\n';
	styles += 'color: \#333333;\n';
	styles += '}\n';
	styles += 'td {\n';
	styles += 'padding: 4px 6px;\n';
	styles += '}\n';
	styles += 'b {\n';
	styles += 'font-weight: bold;\n';
	styles += 'color: #333333;\n';
	styles += '}\n';
	styles += 'table.header td {\n';
	styles += 'padding: 0;\n';
	styles += 'font-size: 10pt;\n';
	styles += '}\n';
	styles += 'table.footer td {\n';
	styles += 'padding: 0;\n';
	styles += 'font-size: 8pt;\n';
	styles += '}\n';
	styles += 'table.itemtable th {\n';
	styles += 'padding-bottom: 10px;\n';
	styles += 'padding-top: 10px;\n';
	styles += '}\n';
	styles += 'table.body td {\n';
	styles += 'padding-top: 2px;\n';
	styles += '}\n';
	styles += 'td.addressheader {\n';
	styles += 'font-size: 8pt;\n';
	styles += 'padding-top: 6px;\n';
	styles += 'padding-bottom: 2px;\n';
	styles += '}\n';
	styles += 'td.address {\n';
	styles += 'padding-top: 0px;\n';
	styles += '}\n';
	styles += 'span.title {\n';
	styles += 'font-size: 28pt;\n';
	styles += '}\n';
	styles += 'span.number {\n';
	styles += 'font-size: 16pt;\n';
	styles += '}\n';
	styles += 'hr {\n';
	styles += 'border-top: 1px dashed \#d3d3d3;\n';
	styles += 'width: 100%;\n';
	styles += 'color: \#ffffff;\n';
	styles += 'background-color: \#ffffff;\n';
	styles += 'height: 1px;\n';
	styles += '}\n';
	styles += '</style>\n';
				
	return styles;
	
}

function genLabels() {

	var reclabels = null;
	var listfields = null;
	
	try {
		reclabels = nlapiLoadRecord('customrecord_wag_label_translation',1);
	
		listfields = reclabels.getAllFields();
	
		labels = new Object();
	
		for (var i=1; i<listfields.length; i++) {
		  if (listfields[i].indexOf('custrecord')!=-1)
		   labels[listfields[i]] = reclabels.getField(listfields[i]).getLabel();
		}
		labels["doctitle"] = "DUNNING LETTER 1"; 
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() )
	}
}

/**
 *  Generate WA Header for PDF Layout
 *  Version 2016-2017
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function genWAHeader(request){
	
	var header= null;
	
	try {
		
	
		header = '<macro id=\"nlheaderWA\">\n';
		header += '<table style=\"width: 100%; font-size: 6pt;\">\n';
		header += '<tr>\n';
		header += '<td width=\"39%\" style=\"font-weight: bold; font-size: 15pt; text-transform: uppercase;\">\n';
		header += '<br />\n <br />\n';
		header += nlapiEscapeXML(labels['doctitle']);
		header += '</td>\n';
		header += '<td width=\"11%\" style=\"padding: 5px 5px 5px;\">\n';
		header += '<p align=\"right\" >\n';
		header += nlapiEscapeXML(labels['custrecord_wag_page_label'])+' <pagenumber/> '+nlapiEscapeXML(labels['custrecord_wag_pageof_label'])+' <totalpages/>';
		header += '</p>\n';
		header += '</td>\n';
		header += '<td width=\"35%\" align=\"right\" >\n';
		header += '<table style=\"font-size: 6pt;\" >\n';
		header += '<tr>\n';
		header += '<td style=\"font-family: \'Arial Narrow\', Arial, sans-serif; font-size: 10pt; color: #5FAA67;\" >\n';
		header += nlapiEscapeXML(subsidiary.getFieldValue('name'));
		header += '</td>\n';
		header += '</tr>\n';
		header += '<tr>\n';
		header += '<td>\n';
		if (native)
			header += nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_ntv_additionaladdress'));
		else
			header += nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_eng_additionaladdress'));
		header += '</td>\n';
		header += '</tr>\n';
		header += '<tr>\n';
		header += '<td>\n';
		header += subsidiary.getFieldValue('mainaddress_text');
		header += '</td>\n';
		header += '</tr>\n';
		header += '<tr>\n';
		header += '<td>\n';
		header += nlapiEscapeXML(labels['custrecord_wag_label_telno']) + nlapiEscapeXML(subsidiary.getFieldValue('phone')) + ' ';
		header += nlapiEscapeXML(labels['custrecord_wag_faxnumber']) + nlapiEscapeXML(subsidiary.getFieldValue('fax'));
		header += '</td>\n';
		header += '</tr>\n';
		header += '</table>\n';
		header += '</td>\n';		
		header += '<td width=\"15%\" style=\"padding: 10px; padding-top: 0px;\" >\n';
		header += '<img width=\"1in\" height=\"1.67in\" src=\"' + nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_printlogouri'))+ '\" />\n';
		header += '</td>\n';
		header += '</tr>\n';
		header += '</table>\n';
		header += '</macro>\n';	
	
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() )
	}
	return header;
}


/**
 *  Generate WA Footer for PDF Layout
 *  Version 2016-2017
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function genWAFooter(request){
	
	var footer = null;
	
	try {
		footer = '<macro id=\"nlfooterWA\">\n';
		footer +=  '<table style=\"width: 100%; font-size: 8pt; text-align:center; align-content: center;\">\n';
		footer +=  '<tr>\n';
		footer +=  '<td width=\"28%\">\n';
		footer +=  '<p style=\"width: 100%; font-size: 6pt; text-align:left; vertical-align:middle;\">\n';
	 	footer +=  '<img src=\"' + nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_certificationlogo')) +'\" style=\"display:inline;';
	 	footer +=  'height: ' + nlapiEscapeXML(subsidiary.getFieldValue('custrecordwag_certlogo_height')) + 'in; width: ';
	 	footer +=  nlapiEscapeXML(subsidiary.getFieldValue('custrecord_wag_certlogo_width')) + 'in; vertical-align: middle;\" />\n';
		footer +=  '<p style=\"display:inline; vertical-align: middle; margin-left:0.05in;\" >\n';
	 	footer +=  nlapiEscapeXML(subsidiary.getFieldValue('custrecord_wag_certif_txt1')) + ' <br />\n';
	 	footer +=  nlapiEscapeXML(subsidiary.getFieldValue('custrecord_wag_certif_txt2'));
	 	footer +=  '</p>\n';
		footer +=  '</p>\n';
		footer +=  '</td>\n';
		footer +=  '<td width=\"44%\" style=\"font-size:5pt; text-align:center;\" class=\"tdc\">\n';
		footer +=  '<p style=\"align:center; vertical-align:bottom;\" >\n';
		if (native) {
			if (subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo1'))
				footer += nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo1')) + '<br />';
			if (subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo2'))
				footer += nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo2')) + '<br />';
			if (subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo3'))
				footer += nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo3'));
		}
		else {
			if (subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo1'))		
				footer += nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo1')) + '<br />';
			if (subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo2'))
				footer += nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo2')) + '<br />';
			if (subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo3'))		
				footer += nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo3'));
		}
	
		footer += '</p>\n';
		footer += '</td>\n';
		footer += '<td width=\"28%\" align=\"right\">\n';
		footer += '<p style=\"font-size:5pt; text-align:right; vertical-align: middle;\" width=\"100%\">\n';
		footer += '<p style=\"display:inline; vertical-align: middle; text-align:left;\" >\n';
		if (native)
			footer += nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_ntv_footertag'));
		else
			footer += nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_eng_footertag'));
		
		footer += '</p>';
		footer += '<img display=\"inline\" src=\"'+ nlapiEscapeXML(subsidiary.getFieldValue('custrecord_wag_sparky_icon_url'));
		footer += '\" width=\"0.462in\" height=\"0.5in\" margin-left=\"0.1in\" />\n';
		footer += '</p>\n';
		footer += '</td>\n';
		footer += '</tr>\n';
		footer += '</table>\n';
		footer += '</macro>\n';
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() )
	}
	
	return footer;
}


function genBodyDunningLetter1(request) {
	
	var body = null;
	try {
		body = "<table><tr><td>TOTO</td></tr></table>\n";
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() )
	}
	
	return body;
}

