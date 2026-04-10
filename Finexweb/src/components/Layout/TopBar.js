import { Menu, MenuItem } from "@progress/kendo-react-layout";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthenticationEndPoints } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import Logo from "../../img/logo.jpg";
import { useSmallWidth } from "../../utils/hooks/useSmallWidth";

const config = {};
const response = await fetch("config.json");
const data = await response.json();
Object.assign(config, data);

export default function TopBar() {
  const host = config?.BASE_URL;
  const navigate = useNavigate();
  const isResize = useSmallWidth(992);
  const [menuList, setMenuList] = useState([]);

  React.useEffect(() => {
    getMenulist();
  }, []);

  const getMenulist = () => {
    axiosInstance({
      method: "GET",
      url: AuthenticationEndPoints.getMenuList,
      withCredentials: false,
    }).then((response) => {
      setMenuList(response.data);

      let menuItem = response.data;
      menuIcon(menuItem);
    });
  };

  const menuIcon = async (menu) => {};

  const ItemRender = (props) => {
    let menuItem = menuList.find((x) => x.MenuTitle == props.item.text);
    let btCol = 12 / menuItem.ChildMenus.length;
    return (
      <div className="container p-3">
        <div
          className={`${isResize ? "column" : "row"}`}
          style={isResize ? { maxHeight: 400 } : null}
        >
          {menuItem.ChildMenus.map((item) => {
            return isResize ? (
              <div
                className={"p-2 d-flex flex-column "}
                key={item.MenuTitle}
              >
                <h6 className="text-success menuHead "> {item.MenuTitle}</h6>
                {item.ChildMenus.map((childitem) => (
                  <li role="menuitem" key={"li" + childitem.MenuTitle}>
                    <Link
                      className="dropdown-link"
                      to={childitem.Url == null ? "/error400" : childitem.Url}
                    >
                      <div className="p-2">
                      </div>
                      <div>
                        <span className="dropdown-link-title">
                          {childitem.MenuTitle}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </div>
            ) : (
              <div
                className={"col-sm-" + btCol + " p-2" + "d-flex flex-col"}
                key={item.MenuTitle}
              >
                <h6 className="text-success menuHead">{item.MenuTitle}</h6>
                <div id="dropdown1" className="dropdown">
                  <ul role="menu">
                    {item.ChildMenus == undefined || item.ChildMenus == null
                      ? null
                      : item.ChildMenus.map((childitem) => (
                        <li role="menuitem" key={"li" + childitem.MenuTitle}>
                          <Link
                            className="dropdown-link"
                            to={
                              childitem.Url == null
                                ? "/error400"
                                : childitem.Url
                            }
                          >
                            <div className="">
                              {childitem.Icon && (
                                <img
                                  width={25}
                                  height={25}
                                  src={`${host}/image/icon/${childitem.Icon}`}
                                  alt={"image"}
                                />
                              )}
                            </div>
                            <div>
                              <span className="dropdown-link-title">
                                {childitem.MenuTitle}
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const onSelect = (event) => {
    if (event.item !== undefined && event.item.data !== undefined) {
      if (event.item.data.route.item.url !== null) {
        navigate(event.item.data.route.item.url);
      } else {
        navigate("/error400");
      }
    }
  };

  return (
    <>
      {
        <nav className="navbar fix navbar-expand-lg navbar-light bg-light shadow-sm ">
          <div className="container-fluid ">
            <Link className="navbar-brand pt-0" to="/">
              <img src={Logo} width={160} alt="logo" />
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <Menu
                onSelect={onSelect}
                openOnClick={true}
                className="topbar-menu"
              >
                {menuList.map((item) =>
                  item.ChildMenus == null ? (
                    <MenuItem
                      text={item.MenuTitle}
                      key={item.MenuTitle}
                      data={{
                        route: { item },
                      }}
                    />
                  ) : (
                    <MenuItem
                      text={item.MenuTitle}
                      key={item.MenuTitle}
                      contentRender={ItemRender}
                      cssClass="active"
                    />
                  )
                )}
              </Menu>
            </div>
          </div>
        </nav>
      }
    </>
  );
}
