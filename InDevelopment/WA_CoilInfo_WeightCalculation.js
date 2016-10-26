/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Oct 2016     david.andre
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {String] linenum Field line number
 * @returns {Void}
 */

function CalculateWeight(type, name,linenum){
	if (type=="recmachcustrecord_nbs_coiltransaction")
		{
			if (name=="custrecord_nbs_coilweight")
				{
					var coilw = nlapiGetCurrentLineItemValue(type,name);
					var cagew = nlapiGetFieldValue("custbody_iag_cageweight");
					var palletw = nlapiGetFieldValue("custbody_iag_palletweight");						
					var totalweight = parseFloat(coilw)+parseFloat(cagew)+parseFloat(palletw);
					nlapiSetCurrentLineItemValue('recmachcustrecord_nbs_coiltransaction', 'custrecord_nbs_coilweightbrutto', totalweight);
				}
		}
}
