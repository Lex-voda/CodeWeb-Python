import { redirect } from 'next/navigation';
import serverGetUserInfo from '../utils/serverGetUserInfo';

export default async function Home() {
    if (! await serverGetUserInfo()) {
        redirect('/login');
    }
    return (
        <div>
            <h1>Home</h1>
        </div>
    )
}
