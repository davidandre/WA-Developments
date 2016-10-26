/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Oct 2016     david.andre
 *  Remove JDExxxx if the address start with this text. Find the first space to remove previous test
 *  
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function cleanupJDEfromAddresses(type) {

	var search = nlapiLoadSearch('customer', 310);
	var resultSet = search.runSearch();
	var custid = '';
	resultSet.forEachResult(function(searchResult)
	   {
		var custid = searchResult.getId();   
		var custom = nlapiLoadRecord('customer',custid);
		var entity = custom.getFieldValue('entityid');
		var nbaddr = custom.getLineItemCount('addressbook');
		var change = false;
		if (entity) {
			for (var i=1;i<=nbaddr;i++)
				{
					var addrtxt = custom.getLineItemValue('addressbook','addrtext',i);
					if (addrtxt) 
					{
						if (addrtxt.indexOf(entity) == 0)
						{
								change = true;
								var newaddr = addrtxt.substring(entity.length);
								if (newaddr) {
									if (newaddr.indexOf('\r') == 0)
										 newaddr = newaddr.substring(1);
									if (newaddr.indexOf('\n') == 0)
										 newaddr = newaddr.substring(1);
								}
								custom.setLineItemValue('addressbook','addrtext',i,newaddr);
								if (i==nbaddr)
									custom.commitLineItem('addressbook',false);
								else
									custom.commitLineItem('addressbook',true);
						}
					}
				}
			}				
		if (change)
				var id = nlapiSubmitRecord(custom);
		return true;
	   });	

}
