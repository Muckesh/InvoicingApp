using System.Text;
using InvoiceApp.Data;
using InvoiceApp.Models;
// using InvoiceApp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvoiceApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly InvoiceAppContext _context;
        // private readonly PdfService _pdfService; // Add this line

        public InvoiceController(InvoiceAppContext context) // Add parameter
        {
            _context = context;
            // _pdfService = pdfService; // Initialize the service
        }

        // GET : api/Invoice
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
        {
            var invoices = await _context.Invoices.Include(i => i.Customer).Include(i => i.Items).ThenInclude(item => item.Product).ToListAsync();
            return Ok(invoices);
        }

        // GET : api/Invoice/id
        [HttpGet("{id}")]
        public async Task<ActionResult<Invoice>> GetInvoice(int id)
        {
            var invoice = await _context.Invoices.Include(i => i.Customer).Include(i => i.Items).ThenInclude(item => item.Product).FirstOrDefaultAsync(i => i.InvoiceId == id);

            if (invoice == null)
            {
                return NotFound();
            }

            return invoice;
        }

        // POST : api/invoice
        [HttpPost]
        public async Task<ActionResult<Invoice>> CreateInvoice(InvoiceRequest invoiceRequest)
        {
            var customer = await _context.Customers.FindAsync(invoiceRequest.CustomerId);
            if (customer == null)
            {
                return BadRequest("Customer not found.");
            }

            var invoice = new Invoice
            {
                CustomerId = invoiceRequest.CustomerId,
                InvoiceDate = DateTime.Now,
                DueDate = invoiceRequest.DueDate,
                Status = "Pending"
            };

            decimal totalAmount = 0;

            foreach(var itemRequest in invoiceRequest.Items)
            {
                var product = await _context.Products.FindAsync(itemRequest.ProductId);
                if (product == null)
                {
                    return BadRequest($"Product with ID {itemRequest.ProductId} not found.");
                }

                var item = new InvoiceItem
                {
                    ProductId = itemRequest.ProductId,
                    Quantity = itemRequest.Quantity,
                    UnitPrice = product.Price
                };

                totalAmount += item.Quantity * item.UnitPrice;
                invoice.Items.Add(item);
            }

            invoice.TotalAmount = totalAmount;

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInvoice), new {id = invoice.InvoiceId},invoice);
        }

        // DELETE : api/Invoice/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
            {
                return NotFound();
            }

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // [HttpGet("{id}/pdf")]
        // public async Task<IActionResult> DownloadInvoicePdf(int id)
        // {
        //     try
        //     {
        //         var invoice = await _context.Invoices
        //             .Include(i => i.Customer)
        //             .Include(i => i.Items)
        //             .ThenInclude(item => item.Product)
        //             .FirstOrDefaultAsync(i => i.InvoiceId == id);

        //         if (invoice == null)
        //         {
        //             return NotFound();
        //         }

        //         var htmlContent = RenderInvoiceHtml(invoice);
        //         var pdfBytes = _pdfService.GeneratePdf(htmlContent);

        //         return File(pdfBytes, "application/pdf", $"Invoice_{invoice.InvoiceId}.pdf");
        //     }
        //     catch (Exception ex)
        //     {
        //         // Log the error
        //         Console.WriteLine($"Error generating PDF: {ex}");
        //         return StatusCode(500, "Error generating PDF");
        //     }
        // }

        // private string RenderInvoiceHtml(Invoice invoice)
        // {
        //     // Create an HTML string that matches your invoice preview
        //     // You can use a Razor view or string concatenation
        //     var sb = new StringBuilder();
        //     sb.Append($@"
        //     <html>
        //     <head>
        //         <style>
        //             body {{ font-family: Arial, sans-serif; }}
        //             .invoice-header {{ display: flex; justify-content: space-between; }}
        //             table {{ width: 100%; border-collapse: collapse; }}
        //             th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        //             .total-amount {{ font-weight: bold; font-size: 1.2em; }}
        //         </style>
        //     </head>
        //     <body>
        //         <div class='invoice-header'>
        //             <div>
        //                 <h2>Invoice #{invoice.InvoiceId}</h2>
        //                 <p><strong>Customer:</strong> {invoice.Customer.Name}</p>
        //                 <p><strong>Date:</strong> {invoice.InvoiceDate.ToShortDateString()}</p>
        //                 <p><strong>Due Date:</strong> {invoice.DueDate.ToShortDateString()}</p>
        //             </div>
        //         </div>
                
        //         <h3>Items</h3>
        //         <table>
        //             <thead>
        //                 <tr>
        //                     <th>Item</th>
        //                     <th>Description</th>
        //                     <th>Quantity</th>
        //                     <th>Unit Price</th>
        //                     <th>Total</th>
        //                 </tr>
        //             </thead>
        //             <tbody>");

        //     foreach (var item in invoice.Items)
        //     {
        //         sb.Append($@"
        //                 <tr>
        //                     <td>{item.Product.Name}</td>
        //                     <td>{item.Product.Description}</td>
        //                     <td>{item.Quantity}</td>
        //                     <td>${item.UnitPrice}</td>
        //                     <td>${item.Quantity * item.UnitPrice}</td>
        //                 </tr>");
        //     }

        //     sb.Append($@"
        //             </tbody>
        //         </table>
                
        //         <div style='text-align: right; margin-top: 20px;'>
        //             <p class='total-amount'>Total: ${invoice.TotalAmount}</p>
        //         </div>
        //     </body>
        //     </html>");

        //     return sb.ToString();
        // }
    }
}

