import { useState, useEffect } from 'react'
import { storeService } from '../services/storeService'

function AsignarRepartidorModal({ isOpen, onClose, tienda, repartidores, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [assigningUserId, setAssigningUserId] = useState(null)

  // Reset error when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setServerError('')
      setAssigningUserId(null)
    }
  }, [isOpen])

  const handleAssign = async (userId) => {
    setIsLoading(true)
    setAssigningUserId(userId)
    setServerError('')

    try {
      await storeService.assignStore(tienda.id, userId)

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess()
      }

      // Cerrar modal
      onClose()
    } catch (error) {
      setServerError(error.message)
      console.error('Error al asignar tienda:', error)
    } finally {
      setIsLoading(false)
      setAssigningUserId(null)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setServerError('')
      onClose()
    }
  }

  if (!isOpen || !tienda) return null

  // Obtener IDs de repartidores ya asignados
  const assignedUserIds = tienda.assignments?.map(a => a.userId) || []

  // Filtrar repartidores disponibles (no asignados y activos)
  const availableRepartidores = repartidores.filter(
    r => !assignedUserIds.includes(r.id)
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Asignar Repartidor</h2>
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-gray-900">{tienda.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{tienda.address}</p>
            </div>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{serverError}</p>
            </div>
          )}

          {/* Currently Assigned Repartidores */}
          {tienda.assignments && tienda.assignments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Repartidores Asignados
              </h3>
              <div className="space-y-2">
                {tienda.assignments.map((assignment) => {
                  const repartidor = repartidores.find(r => r.id === assignment.userId)
                  if (!repartidor) return null

                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{repartidor.name}</p>
                        <p className="text-sm text-gray-600">{repartidor.email}</p>
                      </div>
                      <div className="flex items-center text-green-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Available Repartidores */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Repartidores Disponibles
            </h3>

            {availableRepartidores.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-lg">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-gray-600">
                  No hay repartidores disponibles para asignar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableRepartidores.map((repartidor) => (
                  <div
                    key={repartidor.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{repartidor.name}</p>
                      <p className="text-sm text-gray-600">{repartidor.email}</p>
                    </div>
                    <button
                      onClick={() => handleAssign(repartidor.id)}
                      disabled={isLoading}
                      className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading && assigningUserId === repartidor.id ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Asignando...
                        </span>
                      ) : (
                        'Asignar'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Close button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AsignarRepartidorModal
