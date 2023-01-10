import React from 'react'

export default function LoadingModal() {
  return (
    <div id="loading-modal" className="modal fade show d-block" data-bs-backdrop="static" data-bs-keyboard="false"  aria-hidden="false">
        <div className="modal-dialog h-50 w-50 mx-auto">
          <div className="modal-content h-100">
            <div className="modal-body h-100 bg-dark text-white d-flex justify-content-center align-items-center">Loading...</div>
          </div>
        </div>
      </div>
  )
}
