import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tokenStorage } from '../utils/tokenStorage'
import { userService } from '../services/userService'
import { storeService } from '../services/storeService'
import { productService } from '../services/productService'
import NuevaTiendaModal from '../components/NuevaTiendaModal'
import NuevoRepartidorModal from '../components/NuevoRepartidorModal'
import NuevoProductoModal from '../components/NuevoProductoModal'
import QRModal from '../components/QRModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import AsignarRepartidorModal from '../components/AsignarRepartidorModal'

function Dashboard() {
  const [activeTab, setActiveTab] = useState('repartidores')
  const [user, setUser] = useState(null)
  const [repartidores, setRepartidores] = useState([])
  const [tiendas, setTiendas] = useState([])
  const [productos, setProductos] = useState([])
  const [isLoadingRepartidores, setIsLoadingRepartidores] = useState(true)
  const [isLoadingTiendas, setIsLoadingTiendas] = useState(true)
  const [isLoadingProductos, setIsLoadingProductos] = useState(true)
  const [errorRepartidores, setErrorRepartidores] = useState('')
  const [errorTiendas, setErrorTiendas] = useState('')
  const [errorProductos, setErrorProductos] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = tokenStorage.getUser()
    const token = tokenStorage.getToken()

    if (!storedUser || !token) {
      navigate('/login')
      return
    }

    setUser(storedUser)
  }, [navigate])

  const fetchRepartidores = async () => {
    try {
      setIsLoadingRepartidores(true)
      setErrorRepartidores('')
      const response = await userService.getRepartidores()
      setRepartidores(response.data)
    } catch (error) {
      setErrorRepartidores(error.message)
      console.error('Error al cargar repartidores:', error)
    } finally {
      setIsLoadingRepartidores(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRepartidores()
    }
  }, [user])

  const fetchTiendas = async () => {
    try {
      setIsLoadingTiendas(true)
      setErrorTiendas('')
      const response = await storeService.getStores()
      setTiendas(response.data)
    } catch (error) {
      setErrorTiendas(error.message)
      console.error('Error al cargar tiendas:', error)
    } finally {
      setIsLoadingTiendas(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchTiendas()
    }
  }, [user])

  const fetchProductos = async (searchQuery = '') => {
    try {
      setIsLoadingProductos(true)
      setErrorProductos('')
      const response = await productService.getProducts(searchQuery)
      setProductos(response.data)
    } catch (error) {
      setErrorProductos(error.message)
      console.error('Error al cargar productos:', error)
    } finally {
      setIsLoadingProductos(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProductos()
    }
  }, [user])

  const handleLogout = () => {
    tokenStorage.clearAll()
    navigate('/login')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bienvenido, {user.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Toggle Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('repartidores')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                activeTab === 'repartidores'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Repartidores
            </button>
            <button
              onClick={() => setActiveTab('tiendas')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                activeTab === 'tiendas'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tiendas
            </button>
            <button
              onClick={() => setActiveTab('productos')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                activeTab === 'productos'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Productos
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'repartidores' ? (
            <RepartidoresTab
              repartidores={repartidores}
              isLoading={isLoadingRepartidores}
              error={errorRepartidores}
              onReload={fetchRepartidores}
            />
          ) : activeTab === 'tiendas' ? (
            <TiendasTab
              tiendas={tiendas}
              repartidores={repartidores}
              isLoading={isLoadingTiendas}
              error={errorTiendas}
              onReload={fetchTiendas}
            />
          ) : (
            <ProductosTab
              productos={productos}
              isLoading={isLoadingProductos}
              error={errorProductos}
              onReload={fetchProductos}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function RepartidoresTab({ repartidores, isLoading, error, onReload }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRepartidor, setSelectedRepartidor] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  const handleSuccess = () => {
    if (onReload) {
      onReload()
    }
  }

  const handleDeleteClick = (repartidor) => {
    setSelectedRepartidor(repartidor)
    setDeleteError('')
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedRepartidor) {
      try {
        setDeleteError('')
        await userService.deleteUser(selectedRepartidor.id)
        setIsDeleteModalOpen(false)
        if (onReload) {
          onReload()
        }
      } catch (error) {
        // Detectar error de foreign key constraint
        if (error.message && (
          error.message.includes('Foreign key constraint') ||
          error.message.includes('StoreAssignment')
        )) {
          setDeleteError('No se puede eliminar este repartidor porque tiene tiendas asignadas. Primero debes desasignar las tiendas.')
        } else {
          setDeleteError(error.message || 'Error al eliminar el repartidor')
        }
      }
    }
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeleteError('')
  }

  return (
    <div>
      <NuevoRepartidorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar repartidor?"
        message="Esta acción no se puede deshacer. El repartidor será eliminado permanentemente."
        itemName={selectedRepartidor?.name}
        error={deleteError}
      />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Repartidores</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Lista de repartidores */}
      {!isLoading && !error && repartidores.length > 0 && (
        <div className="space-y-3">
          {repartidores.map((repartidor) => (
            <div
              key={repartidor.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {repartidor.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{repartidor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {repartidor.role}
                  </span>
                  <button
                    onClick={() => handleDeleteClick(repartidor)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar repartidor"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && repartidores.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay repartidores
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Comienza agregando tu primer repartidor
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Agregar repartidor
          </button>
        </div>
      )}
    </div>
  )
}

function TiendasTab({ tiendas, repartidores, isLoading, error, onReload }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedTienda, setSelectedTienda] = useState(null)

  const handleSuccess = () => {
    if (onReload) {
      onReload()
    }
  }

  const handleShowQR = (tienda) => {
    setSelectedTienda(tienda)
    setIsQRModalOpen(true)
  }

  const handleAssign = (tienda) => {
    setSelectedTienda(tienda)
    setIsAssignModalOpen(true)
  }

  const handleAssignSuccess = () => {
    if (onReload) {
      onReload()
    }
  }

  return (
    <div>
      <NuevaTiendaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        tienda={selectedTienda}
      />

      <AsignarRepartidorModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        tienda={selectedTienda}
        repartidores={repartidores}
        onSuccess={handleAssignSuccess}
      />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Tiendas</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nueva
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Grid de tiendas */}
      {!isLoading && !error && tiendas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiendas.map((tienda) => (
            <div
              key={tienda.id}
              className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    tienda.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tienda.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {tienda.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{tienda.address}</p>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-600">
                  {tienda._count.orders} pedidos
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShowQR(tienda)}
                  className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
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
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  <span className="hidden sm:inline">QR</span>
                </button>
                <button
                  onClick={() => handleAssign(tienda)}
                  className="flex-1 py-2 px-4 bg-green-50 text-green-600 hover:bg-green-100 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Asignar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && tiendas.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay tiendas registradas
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Agrega tu primera tienda para comenzar
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Agregar tienda
          </button>
        </div>
      )}
    </div>
  )
}

function ProductosTab({ productos, isLoading, error, onReload }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSuccess = () => {
    if (onReload) {
      onReload(searchQuery)
    }
  }

  // Debouncing para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onReload) {
        onReload(searchQuery)
      }
    }, 500) // 500ms de delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div>
      <NuevoProductoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Productos</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          + Nuevo
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar productos por nombre..."
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
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
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Grid de productos */}
      {!isLoading && !error && productos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
            >
              {/* Imagen del producto */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={producto.imageUrl}
                  alt={producto.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=Sin+Imagen'
                  }}
                />
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {producto.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">SKU: {producto.sku}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                      producto.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {producto.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {producto.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ${parseFloat(producto.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {producto._count.orderItems} pedidos
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && productos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={searchQuery ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" : "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"}
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No se encontraron productos' : 'No hay productos registrados'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {searchQuery
              ? `No hay resultados para "${searchQuery}". Intenta con otro término de búsqueda.`
              : 'Agrega tu primer producto para comenzar'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Agregar producto
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
