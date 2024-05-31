import Link from "next/link";
import Image from "next/image";
import ZkLoginButton from "../Custom/ZkLoginButton";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isLoggedin, setisLoggedin] = useState(true);
  const [navigation, setNavigation] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setisLoggedin(true);
      setNavigation([
        { name: "Add a job", href: "/addjob" },
        { name: "Browse Jobs", href: "/browsejobs" },
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
      ]);
    } else {
      setNavigation([
        { name: "Browse Jobs", href: "/browsejobs" },
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
      ]);
    }
  }, []);

  return (
    <div className="w-screen">
      <nav className="container relative flex flex-wrap items-center justify-between mx-auto lg:justify-between xl:px-16">
        <div className="flex flex-wrap items-center justify-between w-full lg:w-auto">
          <Link href="/">
            <span className="flex items-center space-x-2 text-2xl font-medium text-indigo-500 dark:text-gray-100 mt-2">
              <Image src="/img/logo.svg" alt="N" width="200" height="100" />
            </span>
          </Link>
        </div>

        <div className="hidden text-center lg:flex lg:items-center">
          <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex">
            {navigation.map((menu, index) => (
              <li className="mr-3 nav__item" key={index}>
                <Link
                  href={menu.href || "/"} // Provide a fallback href
                  className="inline-block px-4 py-2 text-lg font-normal text-gray-800 no-underline rounded-md dark:text-gray-200 hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 focus:outline-none dark:focus:bg-gray-800"
                >
                  {menu.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden mr-3 space-x-4 lg:flex nav__item">
          <ZkLoginButton />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
