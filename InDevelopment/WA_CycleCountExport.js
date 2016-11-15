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
	txt='External ID;Adjustement Account;Date;Memo;Subsidiary;Adjustemnt Location;Department;Item Numer; LotNo; Quantity on hand; Adjust Quantity By; Units; Bin Number\n';
	
	
	filtersb[0] = new nlobjSearchFilter( 'location', null, 'anyOf', locationid);
	var binsearch = nlapiSearchRecord('Bin', 'customsearch_wag_binssearch', filtersb);			
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
						txt = txt +'"";"";"'+today.toISOString().substring(0,9)+'";"";';
						txt = txt + subsidiaryname+'";"';
						txt = txt + location+'";"';
						txt = txt + dept+'";"';
						txt = txt + iv.getValue('itemid')+'";"';
						txt = txt + iv.getText('inventorynumber','inventoryDetail')+'";';
						txt = txt + iv.getValue('quantity','inventoryDetail')+';';
						txt = txt + '"";"';
						txt = txt + iv.getText('stockunit')+'";"';
						txt = txt + iv.getText('binnumber','inventoryDetail');
						txt = txt + '"\n';
					}
			}
		}
	}
	
	var form = nlapiCreateForm('Simple Form');
	response.setContentType('CSV','cyclecount.csv');
	response.write(txt);
	
	
}