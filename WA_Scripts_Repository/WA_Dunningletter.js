"use strict";

/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jan 2017     david.andre
 *
 *
 *  Note : This module requires WA_PDF_toolbox.js
 */

/**
 * Global Variables
 */
	var subsidiaryid = null;	
	var native = null;
	var dunningtpl = null;
	var lng = null;
	var custid = null;
	var level = null;
	var invoicelist = null;

	var invoiceslist = null;
		
	var currency_symbols = {
		    'USD': '$', // US Dollar
		    'EUR': '€', // Euro
		    'CRC': '₡', // Costa Rican Colón
		    'GBP': '£', // British Pound Sterling
		    'ILS': '₪', // Israeli New Sheqel
		    'INR': '₹', // Indian Rupee
		    'JPY': '¥', // Japanese Yen
		    'KRW': '₩', // South Korean Won
		    'NGN': '₦', // Nigerian Naira
		    'PHP': '₱', // Philippine Peso
		    'PLN': 'zł', // Polish Zloty
		    'PYG': '₲', // Paraguayan Guarani
		    'THB': '฿', // Thai Baht
		    'UAH': '₴', // Ukrainian Hryvnia
		    'VND': '₫', // Vietnamese Dong
		};
	
/**
 *  Generate Dunning Letter
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function genWADunningLetter(request, response){

	var pdftxt = null;
	var pdffile = null;
	var filterstpl = null;
	var columnstpl = null;
	var dunningsearch = null;
	var history = null;
	var historyid = null;	
	var filters = null;
	var columns = null;
	var historicdl = null;
	var found = null;
	
	try {
	
		custid = request.getParameter("recordid");
		level = request.getParameter("level");

		genWADunningLetterMain(response,false);

	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
	}
	
}
	

/**
 *  Generate Dunning Letter
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function genWADunningLetterMain(response,genfile){

	var pdftxt = null;
	var pdffile = null;
	var filterstpl = null;
	var columnstpl = null;
	var dunningsearch = null;
	var history = null;
	var historyid = null;	
	var filters = null;
	var columns = null;
	var historicdl = null;
	var found = null;
	var lookfortpl = null;
	var looklng = null;
	try {

		subsidiaryid = nlapiLookupField('customer',custid,'subsidiary');
		lng = nlapiLookupField('customer',custid,'language');
		lookfortpl = true;
		looklng = 0;
		
		InitGlobals(subsidiaryid);
				
		//Load Dunning Template
		nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Customer ID : ' + custid );
		nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Letter level: ' + level );		

		// Lookup for the dunning template in locale language
		filterstpl = new Array();
		columnstpl = new Array();

		filterstpl[0] = new nlobjSearchFilter( 'custrecord_wag_dunning_subsidiary', null, 'anyOf', subsidiary);
		filterstpl[1] = new nlobjSearchFilter( 'custrecord_wag_dunning_level', null, 'equalto', level);		
		columnstpl[0] = new nlobjSearchColumn( 'internalid' );

		// Loop to search templates
		// First look for the customer language, if not user language, if not default English
		
		while (lookfortpl && looklng<3) {
				
			filterstpl[2] = new nlobjSearchFilter( 'custrecord_wag_dunning_language', null, 'anyOf', lang[lng]);

			nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Look for the dunning letter template in language : '+lng + '(id)'+lang[lng] );
			dunningsearch  = nlapiSearchRecord( 'customrecord_wag_dunning_texts', null, filterstpl, columnstpl );
				
			if (dunningsearch && dunningsearch.length==1 ) {
				dunningtpl = nlapiLoadRecord('customrecord_wag_dunning_texts',dunningsearch[0].getValue(columnstpl[0]));
				lookfortpl = false;
			} 
			if (looklng==1 && lookfortpl) {
				lng ='en_GB';
			}
			if (looklng==0 && lookfortpl) {
				lng = nlapiLoadConfiguration('userpreferences').getFieldValue('language');		
				if (lng =='en')
					lng ='en_GB';
			}
			looklng ++;
			
		}
		
		if (dunningtpl) {
			// use English or local language
			if (lng=='en_GB')
				native = 1;
			else
				native = 0;
			
			nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Call GenLabels');
			genLabels("");
				
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
			pdftext += '<body header=\"nlheaderWA\" header-height=\"2in\" footer=\"nlfooterWA\" footer-height=\"1in\" padding=\"0.5in 0.5in 0.25in 0.5in\" size=\"A4\" ';
			pdftext += ' background-image=\"' + nlapiEscapeXML(baseurl) + nlapiEscapeXML(company.getFieldValue('custrecord_wag_wa_header_strip_url'));
			pdftext += '\" background-position=\"left top\" background-image-width=\"8.27in\" background-image-height=\"0.5in\" >\n';
		
			nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Call GenBody');
			pdftext += genBodyDunningLetter(request);
			nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Close Body');
			pdftext +='</body>\n</pdf>\n';
				
			nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Prepare response : '+ pdftext);
			pdffile = nlapiXMLToPDF(pdftext);
			nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'File size: '+ pdffile.getSize());
			nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'File type : '+ pdffile.getType());
			
			// If print at screen
			if (!genfile) {
				// set content type, file name, and content-disposition (inline means display in browser)
				nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Set Content Type');		
				response.setContentType('PDF','dunning_letter_' + nlapiLookupField('customer',custid,'entityid') + '_' + level + '.pdf');
			
				// write response to the client
				nlapiLogExecution( 'DEBUG', 'Generate Dunng Letter', 'Write Response');		
				response.write( pdffile.getValue() );
			} else
				// If generate file in file cabinet
			{
				if (subsidiary.getFieldValue('custrecord_wag_dunningletter_storage')) {
					pdffile.setFolder(subsidiary.getFieldValue('custrecord_wag_dunningletter_storage'));
					pdffile.setName('dunning_letter_' + nlapiLookupField('customer',custid,'entityid') + '_' + level + '.pdf');
					nlapiSubmitFile(pdffile);
				}
			}
				
			// Generate History of Dunning letters
			//Load current history for customer and Level to avoid duplicate
			filters = new Array();
			filters[0] = new nlobjSearchFilter( 'custrecord_wag_dunning_hist_lvl', null, 'equalto', level);
			filters[1] = new nlobjSearchFilter( 'custrecord_wag_dunning_hist_cust', null, 'anyOf', custid);
			columns = new Array();
			columns[0] = new nlobjSearchColumn( 'custrecord_wag_dunning_hist_inv');
			columns[1] = columns[0].setSort(); 
			
			nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Run the History search');
			historicdl  = nlapiSearchRecord( 'customrecord_wag_dunning_history', null, filters, columns );

			
			// loop on all invoices affected
				for (var cpt=0;cpt<invoicelist.length;cpt++) {
					found = false;
					//Check if this invoice alread add the same Dunning letter to avoid duplicate in history
					if (historicdl)					
						for (var cpt2=0; (cpt2<historicdl.length) && (!found);cpt2++)
							if (historicdl[cpt2].getValue(columns[0]) ==  invoicelist[cpt] )
								found = true;
				
				// Record DL into history
				if (!found) {
					history = nlapiCreateRecord('customrecord_wag_dunning_history');
					history.setFieldValue('custrecord_wag_dunning_hist_cust',custid);
					history.setFieldValue('custrecord_wag_dunning_history_date',today);					
					history.setFieldValue('custrecord_wag_dunning_hist_lvl',level);
					history.setFieldValue('custrecord_wag_dunning_hist_inv',invoicelist[cpt]);
					historyid = nlapiSubmitRecord(history,false,true);
				}
			}
		}
		nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Exit Generate Dunning Letter');
	}
	
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
	}
	
}


/**
 * Dunningconvert
 *  Special text convertion for the dunning letter
 *   *   Transform the below text to be XML compliant and replace inline variables
 *   variables are
 *      today : today's date
 *      paymentperiod : today's date + number of day defines in the dunning letter template
 *      lastpaymentdate : booking bank date
 *      previousletterdate: date of previous letter sent to the customer
 */

function dunningTextConvert(text) {
	
	var paymentperiod = null;
	var paymentperiodd = null;
	var filters = null;
	var columns  = null;
	var payments = null;
	var paymentdate = null;
	var previousDL = null;
	var previousDLdate = null;
	var previouslevel = null;
	
	try {
		
		filters = new Array();
		columns = new Array();
		
		// IF Text is null ==> empty 
		if (!text)
			text= "";
		
	
		// Set Today's date
		nlapiLogExecution( 'DEBUG', 'PDF Tools - DunningConvert', 'Prepare dates' )
		if (dunningtpl.getFieldValue('custrecord_wag_dunning_paymentperiod'))
			paymentperiodd = nlapiAddDays(todayd,dunningtpl.getFieldValue('custrecord_wag_dunning_paymentperiod'));
		
		if (paymentperiodd)
			paymentperiod = nlapiDateToString(paymentperiodd,"date");
		
		// Replace variables
		nlapiLogExecution( 'DEBUG', 'PDF Tools - DunningConvert', 'Replace variables in text' )
		text = text.replace(/{today}/gi,today);
		if (paymentperiod) 
			text = text.replace(/{paymentperiod}/gi,paymentperiod);
		
		// Previous Dunning Letter (level n-1) date
		
		if (level>1) {
			previouslevel = level -1;
	
			filters[0] = new nlobjSearchFilter( 'custrecord_wag_dunning_hist_lvl', null, 'equalto', previouslevel);
			filters[1] = new nlobjSearchFilter( 'custrecord_wag_dunning_hist_cust', null, 'anyOf', custid);
			columns[0] = new nlobjSearchColumn( 'custrecord_wag_dunning_history_date' );
			columns[1] = columns[0].setSort(true); 
			
			nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Run the Historic search for subst.');
			previousDL  = nlapiSearchRecord( 'customrecord_wag_dunning_history', null, filters, columns );
			
			if (previousDL)
				previousDLdate = previousDL[0].getValue(columns[0]);
			
			if (previousDLdate)
				text = text.replace(/{previousletterdate}/gi,previousDLdate);	
			else
				text = text.replace(/{previousletterdate}/gi,"________________");
		}
		
		//Get Last payment date
		filters.length= 0 ;
		filters[0] = new nlobjSearchFilter( 'type', null, 'anyOf', 'CustPymt');
		filters[1] = new nlobjSearchFilter( 'name', null, 'anyOf', custid);		
		
		nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Set Payment Columns');
		columns.length= 0 ;
		columns[0] = new nlobjSearchColumn( 'tranid' );
		columns[1] = new nlobjSearchColumn( 'trandate' );
		columns[2] = columns[1].setSort(true); 
		
		nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Run the Payment search');
		payments  = nlapiSearchRecord( 'customerpayment', null, filters, columns );
		
		if (payments)
			paymentdate = payments[0].getValue(columns[1]);
	
		if (paymentdate) 
			text = text.replace(/{lastpaymentdate}/gi,paymentdate);
	
		//Convert to XML
		nlapiLogExecution( 'DEBUG', 'PDF Tools - ConvertText', 'Convert to XML' );
		text = convertTextToXML(text);
	
		//BOLD
		text = text.replace((/{bold}/gi),"<b>");
		text = text.replace((/{\/bold}/gi),"</b>");		
		
		//Italic
		text = text.replace((/{italic}/gi),"<i>");
		text = text.replace((/{\/italic}/gi),"</i>");
		
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
	}
	return text;
	
	
}

/**
 *  Generate the body of Dunning letters based on the Dunning letters Template Record
 * 
 * @param request
 * @returns {String}
 */

function genBodyDunningLetter(request) {
	
	var body = null;
	var filters = null;
	var columns = null;
	
	var duedate = null;
	var invoicesearch = null;
	var contact = null;
    var address = null;
    var cptfilter = null;
	var header = null;
	var displayinvoice = null;
	var cpto = null;
	var fromdate = null;
	var todate = null;
	var total = null;
	var curr = null;
	
	try {
		
		// Init Body to empty
		body = "";
		if (dunningtpl) {
				
			nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Set Invoice Filters');
	
			// Calculate from & to dates
			fromdate = nlapiAddDays(todayd,-dunningtpl.getFieldValue('custrecord_wag_dunning_from'));
			if (dunningtpl.getFieldValue('custrecord_wag_dunning_to')) {
				todate = nlapiAddDays(todayd,-dunningtpl.getFieldValue('custrecord_wag_dunning_to'));
			}
			
			
			filters = new Array();
			filters[0] = new nlobjSearchFilter( 'type', null, 'anyOf', 'CustInvc');
			filters[1] = new nlobjSearchFilter( 'entity', null, 'anyOf', custid);
			filters[2] = new nlobjSearchFilter( 'fxamountremaining', null, 'greaterthan', 0);
			filters[3] = new nlobjSearchFilter( 'duedate', null, 'before', fromdate);
			cptfilter = 4;
			if (todate) {
				filters[cptfilter] = new nlobjSearchFilter( 'duedate', null, 'onorafter', todate);
				cptfilter ++;
			}

			
			nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Set Invoice Columns');
			columns = new Array();
			columns[0] = new nlobjSearchColumn( 'tranid' );
			columns[1] = new nlobjSearchColumn( 'trandate' );
			columns[2] = new nlobjSearchColumn( 'duedate' );
			columns[3] = new nlobjSearchColumn( 'fxamountremaining' );
			columns[4] = new nlobjSearchColumn( 'memo' );
			columns[5] = new nlobjSearchColumn( 'currency' );			
			columns[6] = new nlobjSearchColumn( 'internalid' );			
			
			
			nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Run the invoice search--->');
			invoicesearch  = nlapiSearchRecord( 'invoice', null, filters, columns );
			nlapiLogExecution('DEBUG', 'Generate Dunning Letter', '   <--- done');
			
			// Load Finance Contact
			if (dunningtpl.getFieldValue('custrecord_wag_dunning_fincontact'))
				contact = nlapiLoadRecord('employee',dunningtpl.getFieldValue('custrecord_wag_dunning_fincontact'));
			address = nlapiLoadRecord('customer',custid).getFieldValue('defaultaddress');
			
			if (invoicesearch != null) {
				// Define array of invoice for history record
				invoicelist = new Array();
				
				// Display Letter Header
				body += '<table style=\"width: 100%;\">\n';
				body += '<tr>\n';
				body += '<td width=\"50%\">\n'; 
				body += '<p>' 
				body +=  convertTextToXML(address);
				body += '</p>\n';
				body += '</td>\n';
				body += '<td width=\"50%\">\n';
				if (contact) {
					body += '<p>' + labels['custrecord_wag_label_name'] + ': ' + convertTextToXML(contact.getFieldValue('custentity_nbs_employee_printedname'))+ '\n';
					body += '<br />' + labels['custrecord_wag_label_telno'] + ': ' + convertTextToXML(contact.getFieldValue('phone'))+ '\n';
					body += '<br />' + labels['custrecord_wag_label_mobile'] + ': ' + convertTextToXML(contact.getFieldValue('mobilephone'))+ '\n';
					body += '<br />' + labels['custrecord_wag_faxnumber'] + ': ' + convertTextToXML(contact.getFieldValue('fax'))+ '\n';
					body += '<br />' + labels['custrecord_wag_emaillabel'] + ': ' + convertTextToXML(contact.getFieldValue('email'))+ '</p>\n';
				}
				body += '</td>\n';
				body += '</tr>\n';
				body += '<tr>\n';
				body += '<td>\n';
				body += '</td>\n';				
				body += '<td>\n';				
				body += ' <p >' + labels['custrecord_wag_label_date'] + ': ' + dunningTextConvert("{today}")  + '</p>'
				body += '</td>\n';
				body += '</tr>\n';
				body += "</table>\n";		
				
				body += '<table style=\"width: 100%;\">\n';
				body += '<tr>\n';
				body += '<td>\n'; 
				body += '<p style=\"font-weight: bold; text-align: left;\" >' + dunningTextConvert(dunningtpl.getFieldValue('custrecord_wag_dunning_title')) + '</p>\n';
				body += '</td>\n';
				body += '</tr>\n';
				body += '<tr>\n';
				body += '<td>\n';
				body += '<p>' + dunningTextConvert(dunningtpl.getFieldValue('custrecord_wag_dunning_header'))+ '</p>\n';
				body += '</td>\n';
				body += '</tr>\n';
				body += "</table>\n";		
				body += '<table style=\"border: 1px solid; width: 90%;\" >\n';
				nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Loop on ' + invoicesearch.length + 'invoices');
				header = true;
				cpto = 0;
				total = 0;
				curr = '';
				
				for (var cpt=0;invoicesearch != null && cpt < invoicesearch.length;cpt++)
				{
					// If selection of invoice only add the filter
					displayinvoice = false;
					nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Check if user selected some invoices only');
					if (!invoiceslist) {
						displayinvoice = true;
					}else if (invoiceslist && invoiceslist.length>0) {
						nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Check invoice ' + invoicesearch[cpt].getValue(columns[6]));		
						for (var cpti = 0; cpti <invoiceslist.length && !displayinvoice; cpti++) {
							nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Compare to invoice ' + invoiceslist[cpti]);
							if (invoiceslist[cpti] == invoicesearch[cpt].getValue(columns[6])) {
								nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Display ' + invoiceslist[cpti]);
								displayinvoice = true;
							}
						}
					}
					if (displayinvoice) {
						if (header) {
							header = false;
							body += '<thead>\n';
							body += '<tr style=\"border-top: 1px solid; width: 100%;\">\n';
							body += '<td >' + labels['custrecord_wag_invoice_no'] + '</td>\n';
							body += '<td style=\"border-left: 1px solid; \">' + labels['custrecord_wag_label_date'] + '</td>\n';
							body += '<td style=\"border-left: 1px solid; \">' + labels['custrecord_wag_label_duedate'] + '</td>\n';
							body += '<td style=\"border-left: 1px solid; \">' + labels['custrecord_wag_amount'] + '</td>\n';
							body += '<td style=\"border-left: 1px solid; \">' + labels['custrecord_wag_label_description'] + '</td>\n';
							body += '</tr>';
							body += '</thead>\n';
						}
						// Add invoice to history list
						invoicelist[cpto] = invoicesearch[cpt].getValue(columns[6]);
						cpto++;
						
						body += '<tr style=\"border-top: 1px solid; width: 100%;\">\n';
						body += '<td ><p style=\"text-align:left\" >'+ nlapiEscapeXML(invoicesearch[cpt].getValue(columns[0])) + '</p></td>\n';
						body += '<td style=\"border-left: 1px solid; \"><p style=\"text-align:left\" >'+ nlapiEscapeXML(invoicesearch[cpt].getValue(columns[1])) + '</p></td>\n';
						body += '<td style=\"border-left: 1px solid; \"><p style=\"text-align:left\" >'+ nlapiEscapeXML(invoicesearch[cpt].getValue(columns[2])) + '</p></td>\n';
						body += '<td style=\"border-left: 1px solid; \"><p style=\"text-align:right\" >'+ nlapiEscapeXML(invoicesearch[cpt].getValue(columns[3])) + nlapiEscapeXML(currency_symbols[invoicesearch[cpt].getText(columns[5])]) + '</p></td>\n';
						body += '<td style=\"border-left: 1px solid; \"><p style=\"text-align:left\" >'+ nlapiEscapeXML(invoicesearch[cpt].getValue(columns[4])) + '</p></td>\n';
						body += '</tr>';
						nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'invoice currency name : ' + invoicesearch[cpt].getText(columns[5]));
						total += parseFloat(invoicesearch[cpt].getValue(columns[3]));
						curr = nlapiEscapeXML(currency_symbols[invoicesearch[cpt].getText(columns[5])]);						
						
					}
					
				}
				
				// Total row
				if (total>0) {
					body += '<tr style=\"border-top: 1px solid; width: 100%;\">\n';
					body += '<td colspan=\"3\"><p style=\"text-align:left\" >'+ labels['custrecord_wag_label_totalamount'] + '</p></td>\n';
					body += '<td style=\"border-left: 1px solid; \"><p style=\"text-align:right\" >'+ nlapiEscapeXML(total) + ' ' + curr  + '</p></td>\n';
					body += '<td style=\"border-left: 1px solid; \"><p style=\"text-align:left\" ></p></td>\n';
					body += '</tr>';
				}
				body += "</table>\n";
				// Display Footer
				nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Generate footer');
				body += '<table style=\"width: 100%;\">\n';
				body += '<tr>\n';
				body += '<td>\n';
				body += '<p style=\"\" >' + dunningTextConvert(dunningtpl.getFieldValue('custrecord_wag_dunning_footer')) + '</p>\n';
				body += '</td>\n';
				body += '</tr>\n';
				body += '<tr>\n';
				body += '<td>\n';
				body += '</td>\n';
				body += '</tr>\n';
				body += '<tr>\n';
				body += '<td>\n';
				nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Add Signature');
				body += '<p style=\"width: 100%;\">' + dunningTextConvert(dunningtpl.getFieldValue('custrecord_wag_dunning_signature')) + '</p>\n';
				body += '</td>\n';				
				body += '</tr>\n';
				body += '</table>\n\n';
				
			} else
				body="<p>No Invoice to add to this dunning letter</p>";
		} else
			body="<p>Dunning letter template error</p>";
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
	}
//	nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'BODY:' + body);
	return body;
}

/*
 * Suitelet 
 *  Generate list of all customers/invoice to send dunning letter to
 *  
 */
function prepareListofDunningLetters(request, response){

		var userid = null;
		var filters = null;
		var columns = null;
		var dunningsearch = null;
		var invoicesearch = null;		
		var lng = null;
		var dunningform  = null;
		var dl_list = null;
		var curlevel = null;
		var historicdl = null;
		var found = null;
		var cpto = null;
		var params = null; 
		var param = null;
		var paramvalue = null;
		var lettertable = null;
		var sUrl = null;
		var subval =null;
		var curcust = null;
		var fromdate = null
		var todate = null;
		var folderurl = null;
		var lookfortpl = null;
		var looklng = null;
		var dunningname = null;
		
		try {
			nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Init Variables');
			
			// Init variables
			userid = nlapiGetUser();
			subsidiaryid = nlapiGetSubsidiary();
			lookfortpl = true;
			looklng = 0;
			
			InitGlobals(subsidiaryid);
			
			filters = new Array();
			columns = new Array();
			dl_list = new  Array();
			lettertable = new Array();
		
			today = nlapiDateToString(new Date(),'datetime');
			lng = nlapiLoadConfiguration('userpreferences').getFieldValue('language');
			
			nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Context LNG:' + lng);			
			if (!lng || lng=='en')
				lng = 'en_GB';
			nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', '   - End Init Variables');
			
			// Init Form
			nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Init Form');	
			
			dunningform = nlapiCreateForm('List of Invoices Due - Dunning Letters Generator');
			
			if (userid && subsidiaryid) {

				// Search DL templates from level 1 to n (user's language version, then default en_GB)
				filters[0] = new nlobjSearchFilter( 'custrecord_wag_dunning_subsidiary', null, 'anyOf', subsidiaryid);
				columns[0] = new nlobjSearchColumn( 'internalid' );
				columns[1] = new nlobjSearchColumn( 'custrecord_wag_dunning_level' );
				columns[2] = new nlobjSearchColumn( 'custrecord_wag_dunning_from' );
				columns[3] = new nlobjSearchColumn( 'custrecord_wag_dunning_to' );
				columns[4] = columns[1].setSort();
				
				while (lookfortpl && looklng<2) {
					nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Current language '+ lng);
					filters[1] = new nlobjSearchFilter( 'custrecord_wag_dunning_language', null, 'anyOf', lang[lng]);		
			
					nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Look for all dunning letter template for subs ' + subsidiaryid + ' in  language ' + lang[lng] + ':' + lng);
					dunningsearch  = nlapiSearchRecord( 'customrecord_wag_dunning_texts', null, filters, columns);
					if (dunningsearch && dunningsearch.length>0)
						lookfortpl = false;
					
					if (looklng==0 && lookfortpl) {
						lng = 'en_GB';
					}
					looklng++;

				}
				
				if (dunningsearch) {

					// Submitted Form --> After Submit generate the PDF files into the Files cabinet
					
					if (request.getParameter('_button') != null) {
						nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Submitted Form');
						params = request.getAllParameters();
						cpto=-1;
						for (var cpt=0; dunningsearch && dunningsearch.length>cpt; cpt++) {
							curlevel = dunningsearch[cpt].getValue(columns[1]);
							for ( param in params ){
								if (param == 'custpage_list_level'+cpt+'data') {
									paramvalue = params[param];
									paramvalue = paramvalue.split('');
									nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Data splitted Length:'+paramvalue.length );
									for (var cptv=0; cptv < paramvalue.length; cptv++) {
										subval = paramvalue[cptv].split('');
										if (subval[0] == 'T') {
											if (subval[1] != curcust) {
													curcust = subval[1];
													cpto++;
													lettertable[cpto]= new Array();
													lettertable[cpto][2] ='';
													lettertable[cpto][0] = curlevel;
													lettertable[cpto][1] = subval[1];
											}	
											lettertable[cpto][2] += subval[2] + ';';
											nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Selected Lines '+cpto+' : Level:'+lettertable[cpto][0]);
											nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Selected Lines '+cpto+' : Customer:'+lettertable[cpto][1]);
											nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Selected Lines '+cpto+' : Invoice:'+lettertable[cpto][2]);
										}
									}
								}
							}
						}
						// Launch script to generate Letters in the cabinet.
						nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Selected Lines : output Number of lines selected :'+cpto);
						for (var cpt=0;cpt<=cpto;cpt++) {
							custid = lettertable[cpt][1];
							level  = lettertable[cpt][0];
							invoiceslist = lettertable[cpt][2].split(';');
							genWADunningLetterMain(response,true)
						}

						dunningform.addField('custpage_wag_lettercreated','label', 'Dunning letters created.');
					
					}
					
					// Display List of due invoices
					nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Generate Form with due invoices list');
					//Load current history for customer and Level to avoid invoice already treated.
					
					filters.length = 0;
					filters[0] = new nlobjSearchFilter( 'custrecord_wag_dunning_hist_subsidiary', null, 'anyOf', subsidiaryid);
					columns.length = 0;
					columns[0] = new nlobjSearchColumn( 'custrecord_wag_dunning_hist_inv');
					columns[1] = columns[0].setSort(); 
					columns[2] = new nlobjSearchColumn( 'custrecord_wag_dunning_hist_lvl');
					columns[3] = new nlobjSearchColumn( 'custrecord_wag_dunning_hist_inv');
					columns[4] = new nlobjSearchColumn( 'name');					
					
					nlapiLogExecution('DEBUG', 'Generate Dunning Letter', 'Run the History search');
					historicdl  = nlapiSearchRecord( 'customrecord_wag_dunning_history', null, filters, columns );
					
					
					// Add Submit button
					dunningform.addSubmitButton('Generate letters');
					
					for (var cpt=0; dunningsearch && dunningsearch.length>cpt; cpt++) {
						curlevel = dunningsearch[cpt].getValue(columns[1]);
						dunningname = dunningsearch[cpt].getValue(columns[4]);
						// Calculate from & to dates
						fromdate = null
						todate = null;
						fromdate = nlapiAddDays(todayd,-parseInt(dunningsearch[cpt].getValue('custrecord_wag_dunning_from')));
						if (dunningsearch[cpt].getValue('custrecord_wag_dunning_to')) {
							todate = nlapiAddDays(todayd,-parseInt(dunningsearch[cpt].getValue('custrecord_wag_dunning_to')));
						}
						
						nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', todayd + '/ Invoice From: ' + fromdate + ' to: '+todate );
						// Search all invoices with unpaied amount, sorted by customer
						nlapiLogExecution('DEBUG', 'Generate invoice list for Dunning Letters', 'Create invoice search n°'+cpt);
						filters.length=0;
						filters[0] = new nlobjSearchFilter( 'type', null, 'anyOf', 'CustInvc');
						filters[1] = new nlobjSearchFilter( 'subsidiary', null, 'anyOf', subsidiaryid);
						filters[2] = new nlobjSearchFilter( 'fxamountremaining', null, 'greaterthan', 0);
						filters[3] = new nlobjSearchFilter( 'duedate', null, 'before', fromdate);
						if (todate)
							filters[4] = new nlobjSearchFilter( 'duedate', null, 'onorafter', todate);		
						
						columns.length=0;
						columns[0] = new nlobjSearchColumn( 'tranid' );
						columns[1] = new nlobjSearchColumn( 'trandate' );
						columns[2] = new nlobjSearchColumn( 'duedate' );
						columns[3] = new nlobjSearchColumn( 'fxamountremaining' );
						columns[4] = new nlobjSearchColumn( 'memo' );
						columns[5] = new nlobjSearchColumn( 'currency' );			
						columns[6] = new nlobjSearchColumn( 'internalid' );
						columns[7] = new nlobjSearchColumn( 'entity' );
						columns[8] = columns[7].setSort();
						columns[9] = columns[0].setSort();
						columns[10] = columns[2].setSort();						
						
						invoicesearch  = nlapiSearchRecord( 'invoice', null, filters, columns );

						if (invoicesearch && invoicesearch.length>0) {
							//Create Group per level of dunning letter
							dunningform.addSubTab('custpage_tab_level' + cpt ,'Level '+ curlevel);
							// Create sublist per level
							dl_list[cpt] = dunningform.addSubList('custpage_list_level'+cpt, 'list', dunningname);
							dl_list[cpt].addMarkAllButtons();
							//Create list of fields

							dl_list[cpt].addField('custfield_selected_' + cpt,'checkbox',' ');
							dl_list[cpt].addField('custfield_cust_' + cpt,'select','Customer','customer');
							dl_list[cpt].getField('custfield_cust_' + cpt).setDisplayType('inline');							
							dl_list[cpt].addField('custfield_inv_' + cpt,'select','Invoice #','invoice');
							dl_list[cpt].getField('custfield_inv_' + cpt).setDisplayType('inline');							
							dl_list[cpt].addField('custfield_invdate_' + cpt,'date','Invoice date');
							dl_list[cpt].addField('custfield_duedate_' + cpt,'date','Due date');
							dl_list[cpt].addField('custfield_amount_' + cpt,'float','Amount due');
							dl_list[cpt].addField('custfield_currency_' + cpt,'select','Currency','currency');
							dl_list[cpt].getField('custfield_currency_' + cpt).setDisplayType('inline');							
							dl_list[cpt].addField('custfield_memo_' + cpt,'text','Memo');
							
							// Add to the list
							cpto = 0;
							for (var cpti=0; invoicesearch && invoicesearch.length>cpti; cpti++) {
								found = false;
								if (historicdl)					
									for (var cpt2=0; (cpt2<historicdl.length) && (!found);cpt2++)
										if (historicdl[cpt2].getValue('custrecord_wag_dunning_hist_inv') ==  invoicesearch[cpti].getValue(columns[6]))
											if (historicdl[cpt2].getValue('custrecord_wag_dunning_hist_lvl') ==  curlevel)
												found = true;
								if (!found) {
									cpto = cpto +1;
									dl_list[cpt].setLineItemValue('custfield_cust_' + cpt,cpto,invoicesearch[cpti].getValue(columns[7]));
									dl_list[cpt].setLineItemValue('custfield_inv_' + cpt,cpto,invoicesearch[cpti].getValue(columns[6]));
									dl_list[cpt].setLineItemValue('custfield_invdate_' + cpt,cpto,invoicesearch[cpti].getValue(columns[1]));
									dl_list[cpt].setLineItemValue('custfield_duedate_' + cpt,cpto,invoicesearch[cpti].getValue(columns[2]));
									dl_list[cpt].setLineItemValue('custfield_amount_' + cpt,cpto,invoicesearch[cpti].getValue(columns[3]));
									dl_list[cpt].setLineItemValue('custfield_currency_' + cpt,cpto,invoicesearch[cpti].getValue(columns[5]));
									dl_list[cpt].setLineItemValue('custfield_memo_' + cpt,cpto,invoicesearch[cpti].getValue(columns[4]));
								}
							}
						} else {
							dunningform.addField('custpage_wag_error_noinvoice','label','There is no due invoice.');
						}
					}
					
				} else {
					dunningform.addField('custpage_wag_error_notemplate','label','There is no Dunning Letter template defined for your Subsidiary.');
					nlapiLogExecution( 'ERROR', 'Generate invoice list for Dunning Letters', 'No Dunning Letter Template' );
				}
			} else
			{
				dunningform.addField('custpage_wag_error_generalerror','label','User Error. Can\'t generate page');
				nlapiLogExecution( 'ERROR', 'Generate invoice list for Dunning Letters', 'User Error. Can\'t generate page' );
			}
			
			
			// Write the form
			if (dunningform)
				response.writePage(dunningform);
			
			
		}
		catch (e) {
			if ( e instanceof nlobjError )
			    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
			else
			      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
		}
 
}




