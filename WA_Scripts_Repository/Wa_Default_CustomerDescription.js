/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Oct 2016     david.andre
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */

function PostSource(type, name){
	if (type=="item")
		{
			if (name=="item")
				{
					var custdesc = nlapiGetCurrentLineItemValue("item","custcol_wag_customerdescription");
					if (custdesc == "")
						{
							var itemid = nlapiGetCurrentLineItemValue(type,name);
							var custid = nlapiGetFieldValue("entity");
							if (itemid && custid)
								{
									var cusfilters = new Array();
									cusfilters[0] = new nlobjSearchFilter( 'custrecord_wag_std_itemid', null, 'anyOf', itemid);
									cusfilters[1] = new nlobjSearchFilter( 'custrecord_wag_customerid', null, 'anyOf', custid);

									var cuscolumns = new Array();
									cuscolumns[0] = new nlobjSearchColumn( 'name' );
									cuscolumns[1] = new nlobjSearchColumn( 'custrecord_wag_customerdescript2' );
									cuscolumns[2] = new nlobjSearchColumn( 'custrecord_wag_custitemnumber' );

									// execute the Warrenty search, passing all filters and return columns
									var cussearchresults = nlapiSearchRecord( 'customrecord_wag_custitemdesc', null, cusfilters, cuscolumns );
									if (cussearchresults)
										{
											var searchresult = cussearchresults[ 0 ];
											var record = searchresult.getId( );
											var name = searchresult.getValue( 'name' );
											nlapiSetCurrentLineItemValue('item', 'custcol_wag_customerdescription', name);
										}
								}
						}
				}
		}
}
