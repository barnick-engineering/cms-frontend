// import { useSearchParams, useNavigate } from 'react-router-dom'
// import { ConfigDrawer } from '@/components/config-drawer'
// import { Header } from '@/components/layout/header'
// import { Main } from '@/components/layout/main'
// import { ProfileDropdown } from '@/components/profile-dropdown'
// import { Search } from '@/components/search'
// import { ThemeSwitch } from '@/components/theme-switch'
// import { UsersDialogs } from './components/users-dialogs'
// import { UsersPrimaryButtons } from './components/users-primary-buttons'
// import { UsersProvider } from './components/users-provider'
// import { UsersTable } from './components/users-table'
// import { users } from './data/users'

// const Users = () => {
//   const [searchParams, setSearchParams] = useSearchParams()
//   const navigate = useNavigate()

//   // Example: get query param "filter" or other params if needed
//   const filter = searchParams.get('filter') || ''

//   return (
//     <UsersProvider>
//       <Header fixed>
//         <Search />
//         <div className='ms-auto flex items-center space-x-4'>
//           <ThemeSwitch />
//           <ConfigDrawer />
//           <ProfileDropdown />
//         </div>
//       </Header>

//       <Main>
//         <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
//           <div>
//             <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
//             <p className='text-muted-foreground'>
//               Manage your users and their roles here.
//             </p>
//           </div>
//           <UsersPrimaryButtons />
//         </div>

//         <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
//           <UsersTable
//             data={users}
//             search={searchParams}
//             navigate={navigate}
//             filter={filter}
//           />
//         </div>
//       </Main>

//       <UsersDialogs />
//     </UsersProvider>
//   )
// }

// export default Users