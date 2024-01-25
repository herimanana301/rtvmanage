import { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Menu,
  NativeSelect,
  Table,
  ScrollArea,
  Group,
  Text,
  rem,
  ActionIcon,
  Avatar,
} from "@mantine/core";

import { IconPencil, IconTrash } from "@tabler/icons-react";

import { IconSearch, IconFilter } from "@tabler/icons-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { confirmationModal } from "../../services/alertConfirmation";
import Swal from "sweetalert2";
import urls from "../../services/urls";

export default function Personals() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    total: 1,
  });

  const [datas, setDatas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    axios
      .get(urls.StrapiUrl + "api/personnels")
      .then((response) => {
        console.log(response.data.data[0].attributes);
        setDatas(response.data.data);

        setPageInfo((prevdata) => ({
          ...prevdata,
          total: response.data.meta.pagination.total,
        }));
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const deletedUser = async (id) => {
    try {
      const response = await axios.delete(
        urls.StrapiUrl + `api/personnels/${id}`
      );
      console.log("Delete Response:", response);
      if (response.status === 200) {
        setDatas((prevData) => {
          const newData = prevData.filter(
            (data) => data.id !== response.data.data.id
          );
          return newData;
        });

        Swal.fire("Supprimé!", "Personnel supprimé avec succès.", "success");
      }
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const filteredRows = datas
    .filter(
      (item) =>
        item.attributes.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.attributes.prenom
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.attributes.adresse
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.attributes.email
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.attributes.poste.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(
      (item) =>
        !filterStatus ||
        (filterStatus === "Actif" && item.attributes.status === "Actif") ||
        (filterStatus === "Non actif" && item.attributes.status === "Non actif")
    )
    .map((item) => (
      <tr key={item.id}>
        <td>
          <Group gap="sm">
            <Avatar
              size={50}
              radius={50}
              src={urls.StrapiUrl + "uploads/" + item.attributes.avatar}
            />
            <Text fz="sm" fw={500}>
              {item.attributes.nom} {item.attributes.prenom}
              <br />
              <Text fz="xs" c="dimmed">
                {item.attributes.contact}
              </Text>
            </Text>
          </Group>
        </td>

        <td>
          <Text fz="xs" c="dimmed">
            {item.attributes.adresse}
          </Text>
        </td>
        <td>
          <Text fz="xs" c="dimmed">
            {item.attributes.email}
          </Text>
        </td>
        <td>
          <Text fz="xs" c="dimmed">
            {item.attributes.poste}
          </Text>
        </td>
        <td>
          <Text fz="xs" c="dimmed">
            {item.attributes.conge} Jour(s)
          </Text>
        </td>
        <td>
          <Text fz="xs" c="dimmed">
            {item.attributes.status}
          </Text>
        </td>

        <td>
          <Group gap={0} justify="flex-end">
            <ActionIcon variant="subtle" color="gray">
              <Link
                to={{
                  pathname: `/personal/${item.id}`,
                }}
                state={{ personalDatas: item.attributes }}
              >
                <IconPencil
                  style={{ width: rem(16), height: rem(16) }}
                  stroke={1.5}
                />
              </Link>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => {
                confirmationModal(item.id, deletedUser);
              }}
            >
              <IconTrash
                style={{ width: rem(16), height: rem(16), color: "red" }}
                stroke={1.5}
              />
            </ActionIcon>
          </Group>
        </td>
      </tr>
    ));

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button component="a" href="/personal">
          + Nouveau
        </Button>
        <Autocomplete
          placeholder="Rechercher"
          icon={<IconSearch size="1rem" stroke={1.5} />}
          data={[]}
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
        />
        <Menu
          shadow="md"
          width={"auto"}
          position="left"
          offset={5}
          opened={menuVisible}
        >
          <Menu.Target>
            <Button onClick={handleMenuToggle}>
              <IconFilter size="1.1rem" stroke={2} />
              Filtre
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>
              <NativeSelect
                data={["", "Actif", "Non actif"]}
                label="Status"
                radius="md"
                value={filterStatus}
                onChange={(value) => setFilterStatus(value.target.value)}
              />
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
      <ScrollArea>
        <Table sx={{ minWidth: 800 }} verticalSpacing="sm">
          <thead>
            <tr>
              <th>Identité</th>
              <th>Adresse</th>
              <th>Email</th>
              <th>Poste</th>
              <th>Congé restant</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{filteredRows}</tbody>
        </Table>
      </ScrollArea>
    </>
  );
}
