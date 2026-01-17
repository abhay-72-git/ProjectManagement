using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Application.DTOs.Issues;
using ProjectManagement.Application.Interfaces;

namespace ProjectManagement.API.Controllers
{
    [Route("api/issue-documents")]
    [ApiController]
    public class IssueDocumentsController : ControllerBase
    {
        private readonly IIssueDocumentService _service;

        public IssueDocumentsController(IIssueDocumentService service)
        {
            _service = service;
        }

        // POST: api/issue-documents
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] IssueDocumentRequestDto dto)
        {
            var id = await _service.CreateAsync(dto);
            return Ok(new { Id = id });
        }

        // GET: api/issue-documents
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        // PUT: api/issue-documents/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] IssueDocumentRequestDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }

        // DELETE: api/issue-documents/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
