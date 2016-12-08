/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 Nov 2016     david.andre
 * 
 * Cycle Count obj
 * 
 * b = {nlobjSearch} Item (id=407)
 * type = {string} Item
 * id = {number} 407
 * scriptid = {string} customsearch_wag_cyclecountlist
 * public = {boolean} false
 * filters = {array} length=3
 * [0] = {nlobjSearchFilter} department
 * [1] = {nlobjSearchFilter} subsidiary
 * [2] = {nlobjSearchFilter} location (join=inventorynumberbinonhand)
 * columns = {array} length=7
 * [0] = {nlobjSearchColumn} itemid
 * [1] = {nlobjSearchColumn} displayname
 * [2] = {nlobjSearchColumn} stockunit
 * [3] = {nlobjSearchColumn} inventorynumber (inventoryDetail)
 * [4] = {nlobjSearchColumn} quantity (inventoryDetail)
 * [5] = {nlobjSearchColumn} binnumber (inventoryDetail)
 * [6] = {nlobjSearchColumn} location (inventoryNumberBinOnHand)
 *
 *
 * instr({inventorynumberbinonhand.binnumber},{inventorydetail.binnumber})
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */


function CycleCountList(request, response){
	
	
	var inven = nlapiLoadRecord(request.getParameter("record"), request.getParameter("recordid"));
	
	var location = inven.getFieldText('custrecord_wag_cyclecount_adj');
	var locationid = inven.getFieldValue('custrecord_wag_cyclecount_adj');
	var subsidiaryname = inven.getFieldText('custrecord_wag_cyclecount_subsid');
	var dept= inven.getFieldText('custrecord_wag_cyclecount_dept');
	var today= new Date();
	var filtersb = new Array();
	filtersb[0] = new nlobjSearchFilter( 'location', null, 'anyOf', locationid);
	var binsearch = nlapiSearchRecord('Bin', 'customsearch_wag_binssearch', filtersb);			
	
	var bins = new Array();
	
	var filteriv = new Array();

	filteriv[0] = new nlobjSearchFilter( 'location', 'inventoryNumber', 'anyOf', locationid);
	filteriv[1] = new nlobjSearchFilter( 'location', 'inventoryNumberBinOnHand', 'anyOf', locationid);
	
	var ivsearchresults = nlapiSearchRecord('Item', 'customsearch_wag_cyclecountlist', filteriv);
	
	
	// Header of CSV
	txt='"External ID","Adjustement Account","Date","Memo","Subsidiary","Adjustment Location","Department","Item Numer","LotNo","Quantity on hand","Adjust Quantity By","Unit","Bin Number"\n';
	
	
	filtersb[0] = new nlobjSearchFilter( 'location', null, 'anyOf', locationid);
	var binsearch = nlapiSearchRecord('Bin', 'customsearch_wag_binssearch', filtersb);
	var itemid ='';
	var newitem = 0;
	var itemid = '';
	var lotnum = '';
	var qty = 0;
	var stk ='';
	var binn = '';
	
	if (binsearch)
	{

		for (var i = 0; ivsearchresults  != null && i < ivsearchresults.length;i++)
		{
			var iv = ivsearchresults[i];
			var curbin = iv.getText( 'binnumber','inventoryDetail' );
			if (curbin)
			{
					var good = 0;
					for (var j=0; binsearch != null && j <binsearch.length && good==0 ;j++)
					{
						var bin = binsearch[j];
						var binnumber = bin.getValue('binnumber');
						if (binnumber == curbin)
						{
							good = 1;
						} else 
							good = 0;
					}
					if (good == 1) 
					{
						if ((itemid == iv.getValue('itemid')) && (lotnum ==iv.getText('inventorynumber','inventoryDetail')) && (binn==iv.getText('binnumber','inventoryDetail')))
							newitem = 0;
						else
							newitem = 1;
						if (newitem == 1) {
							if (itemid!='') {
								if (qty != 0) {
									txt = txt +'"","","'+today.toISOString().substring(0,9)+'","",';
									txt = txt + subsidiaryname+'","';
									txt = txt + location+'","';
									txt = txt + dept+'","';
									txt = txt + itemid+'","';
									txt = txt + lotnum+'",';
									txt = txt + qty+',';
									txt = txt + '"","';
									txt = txt + stk+'","';
									txt = txt + binn;
									txt = txt + '"\n';
								}
								//qty = parseFloat(iv.getValue('quantity','inventoryDetail'));
							}
							qty = parseFloat(iv.getValue('quantity','inventoryDetail'));
						} else
								qty = qty + parseFloat(iv.getValue('quantity','inventoryDetail'));

						itemid = iv.getValue('itemid');
						lotnum = iv.getText('inventorynumber','inventoryDetail');
						stk =iv.getText('stockunit');
						binn = iv.getText('binnumber','inventoryDetail');
						
//						txt = txt +'"";"";"'+today.toISOString().substring(0,9)+'";"";';
//						txt = txt + subsidiaryname+'";"';
//						txt = txt + location+'";"';
//						txt = txt + dept+'";"';
//						txt = txt + iv.getValue('itemid')+'";"';
//						txt = txt + iv.getText('inventorynumber','inventoryDetail')+'";';
//						txt = txt + iv.getValue('quantity','inventoryDetail')+';';
//						txt = txt + '"";"';
//						txt = txt + iv.getText('stockunit')+'";"';
//						txt = txt + iv.getText('binnumber','inventoryDetail');
//						txt = txt + '"\n';
					}
			}
		}
	}
	
	var form = nlapiCreateForm('Simple Form');
	response.setContentType('CSV','cyclecount.csv');
	response.write(txt);
	
	
}




function CycleCountListXML(request, response){
	
	
	var inven = nlapiLoadRecord(request.getParameter("record"), request.getParameter("recordid"));
	
	var location = inven.getFieldText('custrecord_wag_cyclecount_adj');
	var locationid = inven.getFieldValue('custrecord_wag_cyclecount_adj');
	var subsidiaryname = inven.getFieldText('custrecord_wag_cyclecount_subsid');
	var dept= inven.getFieldText('custrecord_wag_cyclecount_dept');
	var today= new Date();
	var filtersb = new Array();
	filtersb[0] = new nlobjSearchFilter( 'location', null, 'anyOf', locationid);
	var binsearch = nlapiSearchRecord('Bin', 'customsearch_wag_binssearch', filtersb);			
	
	var bins = new Array();
	
	var filteriv = new Array();

	filteriv[0] = new nlobjSearchFilter( 'location', 'inventoryNumber', 'anyOf', locationid);
	filteriv[1] = new nlobjSearchFilter( 'location', 'inventoryNumberBinOnHand', 'anyOf', locationid);
	
	var ivsearchresults = nlapiSearchRecord('Item', 'customsearch_wag_cyclecountlist', filteriv);
	
	
	// Header of XML XLS
	var txt='<?xml version="1.0"?>\n ';
	txt = txt + '<?mso-application progid="Excel.Sheet"?>\n ';
	txt = txt + '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" ';
	txt = txt + 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">\n ';
	txt = txt + '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">\n ';
	txt = txt + '</DocumentProperties>\n ';
	txt = txt + '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">\n ';
	txt = txt + '</ExcelWorkbook>\n ';
	txt = txt + '<Styles>\n ';
	txt = txt + '<Style ss:ID="Default" ss:Name="Normal">\n ';
	txt = txt + '<Alignment ss:Vertical="Bottom"/>\n ';
	txt = txt + '<Borders/>\n ';
	txt = txt + '<Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>\n ';
	txt = txt + '</Style>\n ';
	txt = txt + '<Style ss:ID="s62"><NumberFormat/></Style>\n ';	
	txt = txt + '<Style ss:ID="s63"><NumberFormat ss:Format="Short Date"/></Style>\n ';
	txt = txt + '</Styles>\n ';
	txt = txt + '<Worksheet ss:Name="cyclecount">\n ';
	txt = txt + '<Table ss:ExpandedColumnCount="13" ss:ExpandedRowCount="585" x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="60" ss:DefaultRowHeight="15">\n ';
	txt = txt + '<Row>\n ';
	txt = txt + '<Cell><Data ss:Type="String">External ID</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">Adjustement Account</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">Date</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">Memo</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">Subsidiary</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">Adjustment Location</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">Department</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">Item Numer</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">LotNo</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">Quantity on hand</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">Adjust Quantity By</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">Unit</Data></Cell>\n ';
	txt = txt + '<Cell><Data ss:Type="String">Bin Number</Data></Cell>\n ';
	txt = txt + '</Row>\n ';
	
	
	filtersb[0] = new nlobjSearchFilter( 'location', null, 'anyOf', locationid);
	var binsearch = nlapiSearchRecord('Bin', 'customsearch_wag_binssearch', filtersb);
	var itemid ='';
	var newitem = 0;
	var itemid = '';
	var lotnum = '';
	var qty = 0;
	var stk ='';
	var binn = '';
	
	if (binsearch)
	{

		for (var i = 0; ivsearchresults  != null && i < ivsearchresults.length;i++)
		{
			var iv = ivsearchresults[i];
			var curbin = iv.getText( 'binnumber','inventoryDetail' );
			if (curbin)
			{
					var good = 0;
					for (var j=0; binsearch != null && j <binsearch.length && good==0 ;j++)
					{
						var bin = binsearch[j];
						var binnumber = bin.getValue('binnumber');
						if (binnumber == curbin)
						{
							good = 1;
						} else 
							good = 0;
					}
					if (good == 1) 
					{
						if ((itemid == iv.getValue('itemid')) && (lotnum ==iv.getText('inventorynumber','inventoryDetail')) && (binn==iv.getText('binnumber','inventoryDetail')))
							newitem = 0;
						else
							newitem = 1;
						if (newitem == 1) {
							if (itemid!='') {
								if (qty != 0) {
									txt = txt + '<Row>\n<Cell ss:StyleID="s62"/>\n';
									txt = txt + '<Cell ss:Index="3" ss:StyleID="s63"><Data ss:Type="String">' + today.toISOString().substring(0,9) + '</Data></Cell>\n';
									txt = txt + '<Cell ss:Index="5"><Data ss:Type="String">' + subsidiaryname + '</Data></Cell>\n';
									txt = txt + '<Cell><Data ss:Type="String">' + location + '</Data></Cell>\n';
									txt = txt + '<Cell><Data ss:Type="String">' + dept + '</Data></Cell>\n';
									txt = txt + '<Cell><Data ss:Type="String">' + itemid + '</Data></Cell>\n';
									txt = txt + '<Cell><Data ss:Type="String">' + lotnum + '</Data></Cell>\n';
									txt = txt + '<Cell><Data ss:Type="Number">' + qty + '</Data></Cell>\n';
									txt = txt + '<Cell ss:Index="12"><Data ss:Type="String">' + stk + '</Data></Cell>\n';
									txt = txt + '<Cell><Data ss:Type="String">' + binn + '</Data></Cell>\n';
									txt = txt + '</Row>\n';
								}
								//qty = parseFloat(iv.getValue('quantity','inventoryDetail'));
							}
							qty = parseFloat(iv.getValue('quantity','inventoryDetail'));
						} else
								qty = qty + parseFloat(iv.getValue('quantity','inventoryDetail'));

						itemid = iv.getValue('itemid');
						lotnum = iv.getText('inventorynumber','inventoryDetail');
						stk =iv.getText('stockunit');
						binn = iv.getText('binnumber','inventoryDetail');
						

					}
			}
		}
	}
	
	
	txt = txt + '</Table>\n ';
	txt = txt + '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">\n ';
	txt = txt + '<PageSetup>\n ';
	txt = txt + '<Header x:Margin="0.3"/>\n ';
	txt = txt + '<Footer x:Margin="0.3"/>\n ';
	txt = txt + '<PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>\n ';
	txt = txt + '</PageSetup>\n ';
	txt = txt + '<Selected/>\n ';
	txt = txt + '<Panes>\n ';
	txt = txt + '<Pane>\n ';
	txt = txt + '<Number>3</Number>\n ';
	txt = txt + '<RangeSelection>C1</RangeSelection>\n ';
	txt = txt + '</Pane>\n ';
	txt = txt + '</Panes>\n ';
	txt = txt + '<ProtectObjects>False</ProtectObjects>\n ';
	txt = txt + '<ProtectScenarios>False</ProtectScenarios>\n ';
	txt = txt + '</WorksheetOptions>\n ';
	txt = txt + '</Worksheet>\n ';
	txt = txt + '</Workbook>\n ';
	
	var form = nlapiCreateForm('Simple Form');
	response.setContentType('PLAINTEXT','cyclecount.xls');
	response.write(txt);
	
	
}