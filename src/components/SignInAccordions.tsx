import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props {
  expanded: number | false;
  makeChangeHandler: (
    panel: number
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

const SignInAccordions: React.FC<Props> = ({ expanded, makeChangeHandler }) => {
  return (
    <Box width="315px">
      <Accordion
        sx={{ border: ".75px solid" }}
        expanded={expanded === 1}
        onChange={makeChangeHandler(1)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel1a-content`}
          id={`panel1a-header`}
        >
          <Typography variant="h6" component="h3" fontWeight="bold">
            What is Places?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" component="p">
            <span style={{ fontWeight: "bold" }}>Places</span> allows you to
            search for, get directions to, and like any location, area, region,
            or venue near you. Simply search using a keyword, category, or name
            and explore the world around you!
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion
        sx={{ border: ".75px solid" }}
        expanded={expanded === 2}
        onChange={makeChangeHandler(2)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel2a-content`}
          id={`panel2a-header`}
        >
          <Typography variant="h6" component="h3" fontWeight="bold">
            How do I sign up?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" component="p">
            No need to sign up! We use{" "}
            <a style={{ fontWeight: "bold" }}>Magic Auth</a> to offer
            passwordless authentication, so simply sign in using your preferred
            email, and an account will be created for you. Check your email
            after signing in, look out for a message from Magic, and they will
            guide you through the rest!
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion
        sx={{ border: ".75px solid" }}
        expanded={expanded === 3}
        onChange={makeChangeHandler(3)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel3a-content`}
          id={`panel3a-header`}
        >
          <Typography variant="h6" component="h3" fontWeight="bold">
            How is my location used?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" component="p">
            Places requires your location to offer nearby search results and
            directions - please ensure you have granted location access in your
            browser before signing in!
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default SignInAccordions;
