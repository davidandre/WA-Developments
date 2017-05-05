/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Feb 2017     david.andre
 *
 * These function are used to generate PDF layout for WA / IA ...
 * 
 *       
 */

	var subsidiary = null;
	var company = null;
	var baseurl = null;
	var labels = null;
	var today = null;
	var todayd = null;	
	var lang = null;
	

/**
 *  Init global variables from Netsuite context
 */
function InitGlobals(subsidiaryid) {
	
	var columns = null;
	var searchlng = null;
	
	try {
		nlapiLogExecution('DEBUG', 'WA PDF Toolbox', 'Init Global Variables');
		
		subsidiary = nlapiLoadRecord('subsidiary', subsidiaryid);
		company = nlapiLoadConfiguration('companyinformation');
		baseurl = company.getFieldValue('custrecord_wag_baseurl');
		
		todayd = new Date();
		today = nlapiDateToString(todayd,"date");
		
		// Load Languages
		columns = new Array();
		columns[0] = new nlobjSearchColumn('internalid');
		columns[1] = new nlobjSearchColumn('custrecord_wag_lng_textcode');
		
		searchlng = nlapiSearchRecord('customrecord_wag_languages',null,null,columns);
		lang = new Object();
		
		if (searchlng && searchlng.length>0)
			for (var cpt=0; cpt<searchlng.length; cpt++)
				lang[searchlng[cpt].getValue(columns[1])] = searchlng[cpt].getValue(columns[0]);
			
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
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

function genLabels(doctitle) {

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
		labels["doctitle"] = doctitle; 
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
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
	var printextaddr = false;
	
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
		if (native) {
			if (subsidiary.getFieldValue('custrecord_nbs_ntv_additionaladdress')) {
				header += '<tr>\n';
				header += '<td>\n';
				header += convertTextToXML(subsidiary.getFieldValue('custrecord_nbs_ntv_additionaladdress'));
				header += '</td>\n';
				header += '</tr>\n';
				printextaddr = true;
			}
		}
		else {
			if (subsidiary.getFieldValue('custrecord_nbs_eng_additionaladdress')) {
				header += '<tr>\n';
				header += '<td>\n';
				header += convertTextToXML(subsidiary.getFieldValue('custrecord_nbs_eng_additionaladdress'));
				header += '</td>\n';
				header += '</tr>\n';
				printextaddr = true;
			}
		}
		if (!printextaddr) {
			header += '<tr>\n';
			header += '<td>\n';
			header += nlapiEscapeXML(subsidiary.getFieldValue('mainaddress_text'));
			header += '</td>\n';
			header += '</tr>\n';
			header += '<tr>\n';
			header += '<td>\n';
			header += nlapiEscapeXML(labels['custrecord_wag_label_telno']) + nlapiEscapeXML(subsidiary.getFieldValue('phone')) + ' ';
			header += nlapiEscapeXML(labels['custrecord_wag_faxnumber']) + nlapiEscapeXML(subsidiary.getFieldValue('fax'));
			header += '</td>\n';
			header += '</tr>\n';
		}		
		header += '</table>\n';
		header += '</td>\n';		
		header += '<td width=\"15%\" style=\"padding: 10px; padding-top: 0px;\" >\n';
		header += '<img width=\"1in\" height=\"1.67in\" src=\"' + nlapiEscapeXML(baseurl) + nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_printlogouri'))+ '\" />\n';
		header += '</td>\n';
		header += '</tr>\n';
		header += '</table>\n';
		header += '</macro>\n';	
	
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
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
	 	footer +=  '<img src=\"' + nlapiEscapeXML(baseurl) + nlapiEscapeXML(subsidiary.getFieldValue('custrecord_nbs_certificationlogo')) +'\" style=\"display:inline;';
	 	footer +=  'height: ' + nlapiEscapeXML(subsidiary.getFieldValue('custrecordwag_certlogo_height')) + 'in; width: ';
	 	footer +=  nlapiEscapeXML(subsidiary.getFieldValue('custrecord_wag_certlogo_width')) + 'in; vertical-align: middle;\" />\n';
		footer +=  '<p style=\"display:inline; vertical-align: middle; margin-left:0.05in;\" >\n';
		if (subsidiary.getFieldValue('custrecord_wag_certif_txt1'))
			footer +=  nlapiEscapeXML(subsidiary.getFieldValue('custrecord_wag_certif_txt1')) + ' <br />\n';
	 	if (subsidiary.getFieldValue('custrecord_wag_certif_txt2'))
		footer +=  nlapiEscapeXML(subsidiary.getFieldValue('custrecord_wag_certif_txt2'));
	 	footer +=  '</p>\n';
		footer +=  '</p>\n';
		footer +=  '</td>\n';
		footer +=  '<td width=\"44%\" style=\"font-size:5pt; text-align:center;\" class=\"tdc\">\n';
		footer +=  '<p style=\"align:center; vertical-align:bottom;\" >\n';
		if (native) {
			if (subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo1'))
				footer += convertTextToXML(subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo1')) + '<br />';
			if (subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo2'))
				footer += convertTextToXML(subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo2')) + '<br />';
			if (subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo3'))
				footer += convertTextToXML(subsidiary.getFieldValue('custrecord_nbs_ntv_bankinfo3'));
		}
		else {
			if (subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo1'))		
				footer += convertTextToXML(subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo1')) + '<br />';
			if (subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo2'))
				footer += convertTextToXML(subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo2')) + '<br />';
			if (subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo3'))		
				footer += convertTextToXML(subsidiary.getFieldValue('custrecord_nbs_eng_bankinfo3'));
		}
	
		footer += '</p>\n';
		footer += '</td>\n';
		footer += '<td width=\"28%\" align=\"right\">\n';
		footer += '<p style=\"font-size:5pt; text-align:right; vertical-align: middle;\" width=\"100%\">\n';
		footer += '<p style=\"display:inline; vertical-align: middle; text-align:left;\" >\n';
		if (native)
			footer += convertTextToXML(subsidiary.getFieldValue('custrecord_nbs_ntv_footertag'));
		else
			footer += convertTextToXML(subsidiary.getFieldValue('custrecord_nbs_eng_footertag'));
		
		footer += '</p>';
		footer += '<img display=\"inline\" src=\"' + nlapiEscapeXML(baseurl) + nlapiEscapeXML(subsidiary.getFieldValue('custrecord_wag_sparky_icon_url'));
		footer += '\" width=\"0.462in\" height=\"0.5in\" margin-left=\"0.1in\" />\n';
		footer += '</p>\n';
		footer += '</td>\n';
		footer += '</tr>\n';
		footer += '</table>\n';
		footer += '</macro>\n';
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
	}
	
	return footer;
}

/**

 *      
 *      Syntax to use variables in a text : {variable}    
 * 
 */

function convertTextToXML(text) {	
	

	try {
		
	// IF Text is null ==> empty 
	if (!text)
		text= "";
	
	//Convert to XML
	nlapiLogExecution( 'DEBUG', 'PDF Tools - ConvertText', 'Convert to XML' )
	text = nlapiEscapeXML(text).replace(/(?:\r\n|\r|\n)/g,'<br />').replace(/(?:\r\t|\r|\t)/g,'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
	
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
	}
	return text;
}