#### base.schema.json

<code>object</code> Schema applicable to all file formats.

_Example_:

```json
{
  "$summary": "#",
  "application": "Ansys Fluent",
  "appVersion": "2025 R1",
  "company": "ACME Corporation",
  "createdAt": "2022-01-01T14:35:51Z",
  "creator": "john.doe",
  "description": "string",
  "keywords": [
    "string"
  ],
  "language": "en-US",
  "lastModifiedBy": "john.doe",
  "modifiedAt": "2023-02-01T14:35:51Z",
  "title": "Turbofan Engine",
  "thumbnail": "thumbnail.png",
  "internalPaths": [
    "${name}_files/**/*"
  ],
  "dependencies": [
    "ComponentPart.scdoc"
  ],
  "properties": {
    "additionalProp1": {
      "type": "number",
      "label": "string",
      "value": 0,
      "units": "string"
    },
    "additionalProp2": {
      "type": "string",
      "label": "string",
      "value": "string"
    },
    "additionalProp3": {
      "type": "boolean",
      "label": "string",
      "value": true
    }
  }
}
```

_Properties_:

- **$summary**: _One of_:

  - <code>"#"</code> Indicates that the same object contains all the summary data.
  - <code>Object&lt;string, any&gt;</code> The child object contains the summary data.
  - <code>string /\*uri-reference\*/</code> A link to a an external summary file.
- **application**: <code>string</code>  (_Required_) The name of the application or tool that created this resource. References: [Open XML (Extended): Application](https://ecma-international.org/wp-content/uploads/ECMA-376-1_5th_edition_december_2016.zip), [XMP: CreatorTool](https://github.com/adobe/XMP-Toolkit-SDK/blob/main/docs/XMPSpecificationPart2.pdf), [Step: preprocessor_version](https://en.wikipedia.org/wiki/ISO_10303-21#HEADER_section)
- **appVersion**: <code>string</code>  (_Required_) The version of the application or tool which produced this resource. References: [Open XML (Extended): AppVersion](https://ecma-international.org/wp-content/uploads/ECMA-376-1_5th_edition_december_2016.zip), [Iges: preprocessor version](https://www.govinfo.gov/content/pkg/GOVPUB-C13-7b81ba8b0f709555f162cb496aa63b3b/pdf/GOVPUB-C13-7b81ba8b0f709555f162cb496aa63b3b.pdf)
- **company**: <code>string</code> The organization or group with whom the creator (author) is associated. References: [Iges: author's organization](https://www.govinfo.gov/content/pkg/GOVPUB-C13-7b81ba8b0f709555f162cb496aa63b3b/pdf/GOVPUB-C13-7b81ba8b0f709555f162cb496aa63b3b.pdf), [Open XML (Extended): Company](https://ecma-international.org/wp-content/uploads/ECMA-376-1_5th_edition_december_2016.zip), [Step: organization](https://en.wikipedia.org/wiki/ISO_10303-21#HEADER_section)
- **createdAt**: <code>string /\*date-time\*/</code>  (_Required_) The date and time at which this resource was originally created. References: [dxf: $TDCREATE](https://images.autodesk.com/adsk/files/autocad_2012_pdf_dxf-reference_enu.pdf), [Box: content_created_at](https://developer.box.com/reference/resources/file--full/#param-content_created_at), [Dublin Core: created](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#http://purl.org/dc/terms/created), [Exe (tika): created](https://github.com/apache/tika/blob/main/tika-parsers/tika-parsers-standard/tika-parsers-standard-modules/tika-parser-code-module/src/main/java/org/apache/tika/parser/executable/ExecutableParser.java), [MatLab .mat (tika): created](https://github.com/apache/tika/blob/main/tika-parsers/tika-parsers-standard/tika-parsers-standard-modules/tika-parser-code-module/src/main/java/org/apache/tika/parser/mat/MatParser.java), [Prt (tika): created](https://github.com/apache/tika/blob/main/tika-parsers/tika-parsers-standard/tika-parsers-standard-modules/tika-parser-cad-module/src/main/java/org/apache/tika/parser/prt/PRTParser.java), [XMP: CreateDate](https://github.com/adobe/XMP-Toolkit-SDK/blob/main/docs/XMPSpecificationPart2.pdf), [OneDrive: createdDateTime](https://learn.microsoft.com/en-us/onedrive/developer/rest-api/resources/filesysteminfo?view=odsp-graph-online), [Step: time_stamp](https://en.wikipedia.org/wiki/ISO_10303-21#HEADER_section), [Iges: timestamp of file generation](https://www.govinfo.gov/content/pkg/GOVPUB-C13-7b81ba8b0f709555f162cb496aa63b3b/pdf/GOVPUB-C13-7b81ba8b0f709555f162cb496aa63b3b.pdf)
- **creator**: <code>string</code>  (_Required_) Identifier representing the person or user that originally created the resource. References: [npm: author](https://docs.npmjs.com/cli/v9/configuring-npm/package-json), [Python package: author](https://packaging.python.org/en/latest/specifications/core-metadata/), [Step: author](https://en.wikipedia.org/wiki/ISO_10303-21#HEADER_section), [oEmbed: author_name](https://oembed.com/), [NuGet: authors](https://learn.microsoft.com/en-us/nuget/reference/nuspec), [Dublin Core: creator](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#http://purl.org/dc/elements/1.1/creator), [Dwg (tika): creator](https://github.com/apache/tika/blob/main/tika-parsers/tika-parsers-standard/tika-parsers-standard-modules/tika-parser-cad-module/src/main/java/org/apache/tika/parser/dwg/DWGParser.java), [Iges: name of author](https://www.govinfo.gov/content/pkg/GOVPUB-C13-7b81ba8b0f709555f162cb496aa63b3b/pdf/GOVPUB-C13-7b81ba8b0f709555f162cb496aa63b3b.pdf)
- **dependencies**: <code>string[]</code> A list of file system paths pointing to external designs or projects that this entity depends on.
- **description**: <code>string</code> An account of the resource. References: [ISO 19139: abstract](https://docs.geonetwork-opensource.org/3.12/annexes/standards/iso19139/#abstract), [Dublin Core: description](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#http://purl.org/dc/terms/description), [Dwg (tika): description](https://github.com/apache/tika/blob/main/tika-parsers/tika-parsers-standard/tika-parsers-standard-modules/tika-parser-cad-module/src/main/java/org/apache/tika/parser/dwg/DWGParser.java), [npm: description](https://docs.npmjs.com/cli/v9/configuring-npm/package-json), [NuGet: description](https://learn.microsoft.com/en-us/nuget/reference/nuspec), [Open Graph: description](https://ogp.me/), [Prt (tika): description](https://github.com/apache/tika/blob/main/tika-parsers/tika-parsers-standard/tika-parsers-standard-modules/tika-parser-cad-module/src/main/java/org/apache/tika/parser/prt/PRTParser.java), [Python package: description](https://packaging.python.org/en/latest/specifications/core-metadata/)
- **internalPaths**: <code>string[]</code> A list of file system paths that should be considered as internal to the overall design or project structure.
- **keywords**: <code>string[]</code> A set of keywords to support searching and indexing. This is typically a list of terms that are not available elsewhere in the properties. References: [npm: keywords](https://docs.npmjs.com/cli/v9/configuring-npm/package-json), [Open XML (Core): keywords](https://ecma-international.org/wp-content/uploads/ECMA-376-2_5th_edition_december_2021.zip), [Python package: keywords](https://packaging.python.org/en/latest/specifications/core-metadata/), [NuGet: tags](https://learn.microsoft.com/en-us/nuget/reference/nuspec)
- **language**: <code>string</code> ISO language code indicating the language the resource uses. References: [Dublin Core: language](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#http://purl.org/dc/terms/language), [ISO 19139: language](https://docs.geonetwork-opensource.org/3.12/annexes/standards/iso19139/), [NuGet: language](https://learn.microsoft.com/en-us/nuget/reference/nuspec)
- **lastModifiedBy**: <code>string</code>  (_Required_) Identifier representing the person or user that most recently modified the resource. References: [Open XML (Core): lastModifiedBy](https://ecma-international.org/wp-content/uploads/ECMA-376-2_5th_edition_december_2021.zip), [Dwg (tika): modifier](https://github.com/apache/tika/blob/main/tika-parsers/tika-parsers-standard/tika-parsers-standard-modules/tika-parser-cad-module/src/main/java/org/apache/tika/parser/dwg/DWGParser.java)
- **modifiedAt**: <code>string /\*date-time\*/</code>  (_Required_) The date and time at which this resource was most recently modified. References: [dxf: $TDUPDATE](https://images.autodesk.com/adsk/files/autocad_2012_pdf_dxf-reference_enu.pdf), [Dropbox: client_modified](https://www.dropbox.com/developers/documentation/http/documentation#files-get_metadata), [Box: content_modified_at](https://developer.box.com/reference/resources/file--full/#param-content_created_at), [OneDrive: lastModifiedDateTime](https://learn.microsoft.com/en-us/onedrive/developer/rest-api/resources/filesysteminfo?view=odsp-graph-online), [Dublin Core: modified](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#http://purl.org/dc/terms/modified), [Open Graph: modified_time ](https://ogp.me/#no_vertical), [XMP: ModifyDate](https://github.com/adobe/XMP-Toolkit-SDK/blob/main/docs/XMPSpecificationPart2.pdf)
- **properties**: <code>Object&lt;string, <a href="#anyproperty">AnyProperty</a>&gt;</code>
- **thumbnail**: <code>string /\*uri-reference\*/</code> A path to a file containing a thumbnail.
- **title**: <code>string</code> A name given to the resource. References: [dxf: $PROJECTNAME](https://images.autodesk.com/adsk/files/autocad_2012_pdf_dxf-reference_enu.pdf), [Iges: file name](https://www.govinfo.gov/content/pkg/GOVPUB-C13-7b81ba8b0f709555f162cb496aa63b3b/pdf/GOVPUB-C13-7b81ba8b0f709555f162cb496aa63b3b.pdf), [NuGet: id](https://learn.microsoft.com/en-us/nuget/reference/nuspec), [XMP: Label](https://github.com/adobe/XMP-Toolkit-SDK/blob/main/docs/XMPSpecificationPart2.pdf), [npm: name](https://docs.npmjs.com/cli/v9/configuring-npm/package-json), [Python package: name](https://packaging.python.org/en/latest/specifications/core-metadata/), [Step: name](https://en.wikipedia.org/wiki/ISO_10303-21#HEADER_section), [Dublin Core: title](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#http://purl.org/dc/terms/title), [Dwg (tika): title](https://github.com/apache/tika/blob/main/tika-parsers/tika-parsers-standard/tika-parsers-standard-modules/tika-parser-cad-module/src/main/java/org/apache/tika/parser/dwg/DWGParser.java), [oEmbed: title](https://oembed.com/), [Open Graph: title](https://ogp.me/)
- _Additional properties_: <code>any</code>

#### fluid.schema.json

<code>object</code> Schema applicable to fluid simulation file formats.

_Example_:

```json
{
  "simulation": {
    "fluidBehavior": "Incompressible",
    "flowRegime": "Laminar",
    "turbulenceModel": "Spalart-Allmaras",
    "flowLocation": "External",
    "phaseCount": "Single Phase",
    "multiphaseModel": "Eulerian"
  }
}
```

_Properties_:

- **simulation**: <code>object</code>

  _Properties_:

  - **flowLocation**: _One of_:

    - <code>"External"</code> Flow occurring outside of a defined boundary, such as atmospheric or open water flows.
    - <code>"Free Surface"</code> Flow with a free surface, such as water waves or liquid in a tank.
    - <code>"Internal"</code> Flow occurring within a confined space, such as pipes or ducts.
    - <code>"Porous Media"</code> Flow through materials with interconnected pores, such as soil or filter media.
  - **flowRegime**: _One of_:

    - <code>"Laminar"</code> A flow regime characterized by smooth, orderly fluid motion.
    - <code>"Transitional"</code> A flow regime that is between laminar and turbulent, where flow patterns are unstable.
    - <code>"Turbulent"</code> A flow regime characterized by chaotic, irregular fluid motion.
  - **fluidBehavior**: _One of_:

    - <code>"Compressible"</code> Fluid behavior where density can change significantly with pressure and temperature variations.
    - <code>"Incompressible"</code> Fluid behavior where density remains constant regardless of pressure changes.
  - **multiphaseModel**: _One of_:

    - <code>"Discrete Phase"</code> A model that tracks individual particles or droplets within the flow.
    - <code>"Eulerian"</code> A multiphase model that treats each phase as a continuous field.
    - <code>"Mixture"</code> A model that treats the phases as a mixture with averaged properties.
    - <code>"VOF"</code> Volume of fluid model, which tracks the interface between different phases.
  - **phaseCount**: _One of_:

    - <code>"Multiphase"</code> A simulation involving multiple phases of matter, such as liquid-gas or solid-liquid interactions.
    - <code>"Single Phase"</code> A simulation involving only one phase of matter, such as liquid or gas.
  - **turbulenceModel**: _One of_:

    - <code>"k-epsilon"</code> A two-equation turbulence model widely used for general-purpose simulations.
    - <code>"k-omega"</code> A two-equation turbulence model that is effective in boundary layer flows.
    - <code>"LES"</code> Large Eddy Simulation, a method that resolves large-scale turbulent structures while modeling smaller scales.
    - <code>"Reynolds Stress"</code> A model that resolves the Reynolds stresses directly, providing detailed turbulence information.
    - <code>"Spalart-Allmaras"</code> A one-equation turbulence model suitable for aerospace applications.
  - _Additional properties_: <code>any</code>
- _Additional properties_: <code>any</code>

#### geometry.schema.json

<code>object</code> Schema applicable to file formats representing something with that takes up physical space and/or time. This include photos, images, audio, 2D designs, 3D models, meshes, and point clouds

_Example_:

```json
{
  "extents": {
    "width": {
      "value": 123,
      "units": "mm"
    },
    "height": {
      "value": 123,
      "units": "mm"
    },
    "depth": {
      "value": 123,
      "units": "mm"
    },
    "dimensions": 0,
    "layers": 7,
    "duration": {
      "value": 70.2,
      "units": "seconds"
    },
    "volume": {
      "value": 12345,
      "units": "mm^3"
    },
    "mass": {
      "value": 0.5,
      "units": "kg"
    },
    "pointCount": 12345,
    "elementCount": 12345,
    "granularity": {
      "value": 5,
      "units": "um"
    }
  }
}
```

_Properties_:

- **extents**: <code>object</code> The physical extents of the content.

  _Properties_:

  - **depth**: <code><a href="#valuewithunit">ValueWithUnit</a></code> The physical depth.
  - **dimensions**: <code>0 | 1 | 2 | 3</code> The number of physical dimensions represented.
  - **duration**: <code><a href="#valuewithunit">ValueWithUnit</a></code> The time duration.
  - **elementCount**: <code>integer</code> The number of discrete elements.
  - **granularity**: <code><a href="#valuewithunit">ValueWithUnit</a></code> The smallest size that is or can be represented.
  - **height**: <code><a href="#valuewithunit">ValueWithUnit</a></code> The physical height.
  - **layers**: <code>number</code> The number of layers or pages.

    - _Value_ ≥ `1`
  - **mass**: <code><a href="#valuewithunit">ValueWithUnit</a></code> The physical mass.
  - **pointCount**: <code>integer</code> The number of points or nodes.
  - **volume**: <code><a href="#valuewithunit">ValueWithUnit</a></code> The physical volume.
  - **width**: <code><a href="#valuewithunit">ValueWithUnit</a></code> The physical width.
  - _Additional properties_: <code>any</code>
- _Additional properties_: <code>any</code>

#### material.schema.json

<code>object</code> Schema applicable to file formats that include materials, and potentially material assignments to various components.

_Example_:

```json
{
  "materialBehavior": "Static",
  "materials": [
    {
      "title": "Aluminum 6061-T6",
      "chemicalComposition": [
        "Al",
        "Mg",
        "Si",
        "Cu",
        "Cr"
      ],
      "electricalConductivity": {
        "value": 25000000,
        "units": "S/m"
      },
      "electricalResistivity": {
        "value": 4e-8,
        "units": "Ohm.m"
      },
      "massDensity": {
        "value": 2710,
        "units": "kg/m^3"
      },
      "poissonsRatio": 0.33,
      "specificHeatCapacity": {
        "value": 916,
        "units": "J/(kg.K)"
      },
      "stateOfMatter": "solid",
      "tensileYieldStrength": {
        "value": 314000000,
        "units": "MPa"
      },
      "thermalConductivity": {
        "value": 155,
        "units": "(W/(m.K))"
      },
      "thermalExpansionCoefficient": {
        "value": 0.0000228,
        "units": "(1/K)"
      },
      "youngsModulus": {
        "value": 69000000000,
        "units": "(Pa)"
      }
    }
  ]
}
```

_Properties_:

- **materialBehavior**: The behavior of the materials in a simulation.

  _One of_:

  - <code>"Anisotropic"</code>
  - <code>"Hyperelastic"</code>
  - <code>"Piezoelectric"</code>
  - <code>"Plastic"</code>
  - <code>"Static"</code> Key material properties are modeled as constants over the course of the simulation.
  - <code>"Temperature-dependent"</code> Key material properties are functions of temperature.
  - <code>"Viscoelastic"</code>
  - <code>"Viscoplastic"</code>
- **materials**: <code>Array&lt;<a href="#material">Material</a>&gt;</code> A listing of the materials used.
- _Additional properties_: <code>any</code>

#### opticAcoustic.schema.json

<code>object</code> Schema applicable to optics or acoustics simulation file formats.

_Example_:

```json
{
  "simulation": {
    "energyPropagationModel": "Ray"
  }
}
```

_Properties_:

- **simulation**: <code>object</code>

  _Properties_:

  - **energyPropagationModel**: _One of_:

    - <code>"Photons"</code> A model that simulates the propagation of energy as photons, suitable for quantum optics and photon-based simulations.
    - <code>"Ray"</code> A model that simulates the propagation of energy as rays, suitable for geometries with well-defined surfaces.
    - <code>"Wave"</code> A model that simulates the propagation of energy as waves, suitable for continuous media and wave phenomena.
  - _Additional properties_: <code>any</code>
- _Additional properties_: <code>any</code>

#### parameters.schema.json

<code>object</code> Schema applicable to file formats describing a parameterized component that can be executed with user-specified inputs and outputs.

_Example_:

```json
{
  "parameters": {
    "inlet_pressure": {
      "label": "Inlet Pressure",
      "type": "number",
      "format": "float64",
      "minimum": 0,
      "maximum": 100,
      "description": "The pressure at the valve inlet",
      "usage": "input",
      "units": "MPa",
      "default": 50
    },
    "pressure_type": {
      "label": "Pressure Type",
      "type": "string",
      "enum": [
        "continuous",
        "ramp up",
        "ramp down"
      ],
      "usage": "input",
      "default": "continuous"
    },
    "outlet_velocity": {
      "label": "Outlet Velocity",
      "type": "number",
      "format": "float64",
      "usage": "output",
      "units": "m/s",
      "default": 17.3
    }
  },
  "parameterSets": [
    {
      "name": "DP0",
      "parameters": {
        "inlet_pressure": 50,
        "pressure_type": "continuous",
        "outlet_velocity": 17.3
      },
      "properties": {
        "up_to_date": {
          "type": "boolean",
          "value": true
        }
      }
    },
    {
      "name": "DP1",
      "parameters": {
        "inlet_pressure": 54,
        "pressure_type": "continuous",
        "outlet_velocity": null
      },
      "properties": {
        "up_to_date": {
          "type": "boolean",
          "value": false
        }
      }
    }
  ]
}
```

_Properties_:

- **parameters**: <code>Object&lt;string, <a href="#parameter">Parameter</a>&gt;</code>
- **parameterSets**: <code>object[]</code>

  - _All items_: <code>object</code>

    _Properties_:

    - **name**: <code>string</code>
    - **parameters**: <code>Object&lt;string, boolean | number | string&gt;</code>
    - **properties**: <code>Object&lt;string, <a href="#anyproperty">AnyProperty</a>&gt;</code>
    - _Additional properties_: <code>any</code>
- _Additional properties_: <code>any</code>

#### simulation.schema.json

<code>object</code> Schema applicable to simulation file formats.

_Example_:

```json
{
  "simulation": {
    "modelType": "Full-Fidelity Geometric",
    "behaviorsAnalyzed": [
      "Acoustic",
      "Biological",
      "Electric",
      "Electrochemical",
      "Electromagnetic",
      "Fluid",
      "Magnetic",
      "Operational",
      "Optical",
      "Semiconductor",
      "Software Logic",
      "Structural",
      "Thermal"
    ],
    "timeDomain": "Static",
    "frequencyDomain": "High"
  }
}
```

_Properties_:

- **simulation**: <code>object</code>

  _Properties_:

  - **behaviorsAnalyzed**: <code>array</code>  (_Required_)

    - _All items_: _One of_:

      - <code>"Acoustic"</code> How sound interacts with the design.
      - <code>"Biological"</code> The physiological or biological implications of the design.
      - <code>"Electric"</code>
      - <code>"Electrochemical"</code>
      - <code>"Electromagnetic"</code>
      - <code>"Fluid"</code>
      - <code>"Magnetic"</code>
      - <code>"Operational"</code> The operational behaviors of a system in the context of a scenario.
      - <code>"Optical"</code>
      - <code>"Semiconductor"</code>
      - <code>"Software Logic"</code>
      - <code>"Structural"</code>
      - <code>"Thermal"</code>
  - **frequencyDomain**: _One of_:

    - <code>"Harmonic"</code>
    - <code>"High"</code>
    - <code>"Low"</code>
    - <code>"Modal"</code>
    - <code>"Random"</code>
    - <code>"Shock / Impact"</code>
  - **modelType**:  (_Required_)

    _One of_:

    - <code>"Design Optimization"</code> A simulation set-up focused on running a design of experiments in order to optimize a design of any fidelity.
    - <code>"Full-Fidelity Geometric"</code> A simulation that models how 2D or 3D geometric components physically react under some conditions. This generally involves meshing the geometries first in order to solve the problem.
    - <code>"Lumped Element"</code> A simplified representation of a physical system or circuit that assumes all components are concentrated at a single point and their behavior can be described by idealized mathematical models.
    - <code>"Reduced Order"</code> A simplified model of a full geometric problem that can be solved more quickly with fewer resources yet slightly lower accuracy.
    - <code>"Scenario"</code> A simulation that identifies whether scenario objectives can be met when components are used on a particular time or date in particular locations within the universe under particular weather conditions.
    - <code>"System Integration"</code> A system model where components are modeled as parameterized black boxes.
  - **timeDomain**:  (_Required_)

    _One of_:

    - <code>"Static"</code> A simulation that assumes no time-varying effects, often used for steady-state conditions.
    - <code>"Steady-State"</code> A simulation that focuses on the long-term behavior of a system after transient effects have dissipated.
    - <code>"Transient"</code> A simulation that models time-varying effects, capturing how the system evolves over time.
  - _Additional properties_: <code>any</code>
- _Additional properties_: <code>any</code>

#### softwarePackage.schema.json

<code>object</code> Schema applicable to formats which represent software packages, libraries, components, extensions, plug-ins, or add-ins.

_Example_:

```json
{
  "license": "MIT",
  "supportedPlatforms": "windows-x86",
  "url": "https://example.com",
  "version": "1.3.0"
}
```

_Properties_:

- **license**: <code>string</code> Text instructions (or a URL reference to such instructions) indicating how a resource can be legally used. References: [npm: license](https://docs.npmjs.com/cli/v9/configuring-npm/package-json), [NuGet: license](https://learn.microsoft.com/en-us/nuget/reference/nuspec), [Python package: license](https://packaging.python.org/en/latest/specifications/core-metadata/), [XMP: UsageTerms](https://github.com/adobe/XMP-Toolkit-SDK/blob/main/docs/XMPSpecificationPart1.pdf)
- **supportedPlatforms**: <code>string[]</code> The operating system platform (and CPU architecture) supported for the computation.

  - _All items_: <code>string</code>

    - String matches pattern `(aix|android|browser|darwin|dragonfly|freebsd|haiku|hurd|illumos|ios|linux(-musl)?|netbsd|openbsd|solaris|tvos|wasi|windows|other)(-(x86|x64|arm|arm64|loong64|mips|mipsel|mips64|mips64el|ppc|ppc64|ppc64le|riscv|riscv64|s390|s390x|sparc|sparc64|wasm))?`
- **url**: <code>string /\*uri\*/</code> The location where the resource primarily resides or is described. References: [npm: homepage](https://docs.npmjs.com/cli/v9/configuring-npm/package-json), [Python package: home-page](https://packaging.python.org/en/latest/specifications/core-metadata/), [NuGet: projectUrl](https://learn.microsoft.com/en-us/nuget/reference/nuspec), [Python package: project-url](https://packaging.python.org/en/latest/specifications/core-metadata/), [Open Graph: url](https://ogp.me/)
- **version**: <code>string</code> The internally set version of the resource. References: [npm: version](https://docs.npmjs.com/cli/v9/configuring-npm/package-json), [NuGet: version](https://learn.microsoft.com/en-us/nuget/reference/nuspec), [Open XML (Core): version](https://ecma-international.org/wp-content/uploads/ECMA-376-2_5th_edition_december_2021.zip), [Python package: version](https://packaging.python.org/en/latest/specifications/core-metadata/)
- _Additional properties_: <code>any</code>

#### structure.schema.json

<code>object</code> Schema applicable to structural simulation file formats.

_Example_:

```json
{
  "simulation": {
    "structuralModel": "Linear",
    "structuralBehavior": "Buckling"
  }
}
```

_Properties_:

- **simulation**: <code>object</code>

  _Properties_:

  - **structuralBehavior**: _One of_:

    - <code>"Buckling"</code> A structural behavior that describes the failure mode of a structure under compressive loads.
    - <code>"Creep"</code> A time-dependent deformation of materials under constant load.
    - <code>"Deflection"</code> The displacement of a structural element under load.
    - <code>"Fatigue"</code> The weakening of a material caused by repeatedly applied loads.
    - <code>"Fracture/Crack Growth"</code> The propagation of cracks in materials under stress.
    - <code>"Impact/Crash"</code> The response of structures to sudden forces or impacts.
    - <code>"Vibration"</code> Oscillations of structures due to dynamic loads.
  - **structuralModel**: _One of_:

    - <code>"Linear"</code> A structural model that assumes linear relationships between forces and displacements, suitable for small deformations.
    - <code>"Nonlinear"</code> A structural model that accounts for nonlinear relationships, suitable for large deformations or complex material behaviors.
  - _Additional properties_: <code>any</code>
- _Additional properties_: <code>any</code>

#### units.schema.json

<code>object</code> Schema applicable to file formats a physical model or problem in a specific unit system such as 3D models or simulation models.

_Example_:

```json
{
  "units": {
    "system": "Metric (kg,m,s,°C,A,N,V)",
    "length": "mm",
    "mass": "g",
    "time": "s",
    "temperature": "degC",
    "current": "A",
    "luminousIntensity": "cd",
    "chemicalAmount": "mol"
  }
}
```

_Properties_:

- **units**: <code>object</code> The default unit system for the file

  _Properties_:

  - **chemicalAmount**: <code>string</code> The default unit for chemical amount.
  - **current**: <code>string</code> The default unit for current.
  - **length**: <code>string</code> The default unit for length.
  - **luminousIntensity**: <code>string</code> The default unit for luminous intensity.
  - **mass**: <code>string</code> The default unit for mass.
  - **system**: <code>string</code> The name of the unit system.
  - **temperature**: <code>string</code> The default unit for temperature.
  - **time**: <code>string</code> The default unit for time.
  - _Additional properties_: <code>any</code>
- _Additional properties_: <code>any</code>

#### AnyProperty

_Example_:

```json
{
  "type": "number",
  "label": "string",
  "value": 0,
  "units": "string"
}
```

_One of_:

- <code><a href="#booleanproperty">BooleanProperty</a></code>
- <code><a href="#datetimeproperty">DateTimeProperty</a></code>
- <code><a href="#numberproperty">NumberProperty</a></code>
- <code><a href="#objectproperty">ObjectProperty</a></code>
- <code><a href="#stringproperty">StringProperty</a></code>
- <code><a href="#tableproperty">TableProperty</a></code>
- <code><a href="#uriproperty">UriProperty</a></code>

#### BooleanParameter

<code>object</code> A user parameter of type boolean which represent either an input to or output of the design. This can be an individual value or an array of values.

_Example_:

```json
{
  "type": "boolean",
  "multiValue": true,
  "label": "string",
  "description": "string",
  "usage": "input",
  "default": true
}
```

_Properties_:

- **default**: <code>boolean | boolean[]</code> The default value(s).
- **description**: <code>string</code> A human-readable description.
- **label**: <code>string</code> A human-readable label.
- **multiValue**: <code>boolean</code> Indicates if the parameter can have multiple values (is an array).
- **type**: <code>"boolean"</code>  (_Required_) The data type.
- **usage**: <code><a href="#parameterusage">ParameterUsage</a></code>  (_Required_)

#### BooleanProperty

<code>object</code>

_Example_:

```json
{
  "type": "boolean",
  "label": "string",
  "value": true
}
```

_Properties_:

- **label**: <code>string</code>
- **type**: <code>"boolean"</code>  (_Required_)
- **value**: <code>boolean | boolean[]</code>  (_Required_)

#### DateTimeParameter

<code>object</code> A user parameter of type date-time which represent either an input to or output of the design. This can be an individual value or an array of values.

_Example_:

```json
{
  "type": "date-time",
  "multiValue": true,
  "label": "string",
  "description": "string",
  "usage": "input",
  "default": "2018-11-13T20:20:39+00:00"
}
```

_Properties_:

- **default**: <code>Array&lt;string /\*date-time\*/&gt; | string /\*date-time\*/</code> The default value(s).
- **description**: <code>string</code> A human-readable description.
- **label**: <code>string</code> A human-readable label.
- **multiValue**: <code>boolean</code> Indicates if the parameter can have multiple values (is an array).
- **type**: <code>"date-time"</code>  (_Required_) The data type.
- **usage**: <code><a href="#parameterusage">ParameterUsage</a></code>  (_Required_)

#### DateTimeProperty

<code>object</code>

_Example_:

```json
{
  "type": "date-time",
  "label": "string",
  "value": "2018-11-13T20:20:39+00:00"
}
```

_Properties_:

- **label**: <code>string</code>
- **type**: <code>"date-time"</code>  (_Required_)
- **value**: <code>Array&lt;string /\*date-time\*/&gt; | string /\*date-time\*/</code>  (_Required_)

#### Material

<code>object</code>

_Example_:

```json
{
  "title": "Aluminum 6061-T6",
  "chemicalComposition": [
    "Al",
    "Mg",
    "Si",
    "Cu",
    "Cr"
  ],
  "electricalConductivity": {
    "value": 25000000,
    "units": "S/m"
  },
  "electricalResistivity": {
    "value": 4e-8,
    "units": "Ohm.m"
  },
  "massDensity": {
    "value": 2710,
    "units": "kg/m^3"
  },
  "poissonsRatio": 0.33,
  "specificHeatCapacity": {
    "value": 916,
    "units": "J/(kg.K)"
  },
  "stateOfMatter": "solid",
  "tensileYieldStrength": {
    "value": 314000000,
    "units": "MPa"
  },
  "thermalConductivity": {
    "value": 155,
    "units": "(W/(m.K))"
  },
  "thermalExpansionCoefficient": {
    "value": 0.0000228,
    "units": "(1/K)"
  },
  "youngsModulus": {
    "value": 69000000000,
    "units": "(Pa)"
  }
}
```

_Properties_:

- **chemicalComposition**: <code>string[]</code> A listing of the chemical formulas that describe the material. For simple materials (like water), this would be an array of a single element. For mixtures and alloys, include each component in descending order of percent composition (most frequently occurring component first).

  - _All items_: <code>string</code> The chemical formula of the material, if applicable.

    - String matches pattern `((H|He|Li|Be|B|C|N|O|F|Ne|Na|Mg|Al|Si|P|S|Cl|Ar|K|Ca|Sc|Ti|V|Cr|Mn|Fe|Co|Ni|Cu|Zn|Ga|Ge|As|Se|Br|Kr|Rb|Sr|Y|Zr|Nb|Mo|Tc|Ru|Rh|Pd|Ag|Cd|In|Sn|Sb|Te|I|Xe|Cs|Ba|La|Ce|Pr|Nd|Pm|Sm|Eu|Gd|Tb|Dy|Ho|Er|Tm|Yb|Lu|Hf|Ta|W|Re|Os|Ir|Pt|Au|Hg|Tl|Pb|Bi|Po|At|Rn|Fr|Ra|Ac|Th|Pa|U|Np|Pu|Am|Cm|Bk|Cf|Es|Fm|Md|No|Lr|Rf|Db|Sg|Bh|Hs|Mt|Ds|Rg|Cn|Nh|Fl|Mc|Lv|Ts|Og)\d*)+`
- **citation**: <code>string /\*uri\*/</code>
- **dielectricLossTangent**: <code>number</code>
- **dynamicViscosity**: <code><a href="#valuewithunit">ValueWithUnit</a></code>
- **electricalConductivity**: <code><a href="#valuewithunit">ValueWithUnit</a></code>
- **electricalResistivity**: <code><a href="#valuewithunit">ValueWithUnit</a></code>
- **id**: <code>string</code> The internal identifier of the material.
- **magneticLossTangent**: <code>number</code>
- **magneticPermeability**: <code><a href="#valuewithunit">ValueWithUnit</a></code>
- **massDensity**: <code><a href="#valuewithunit">ValueWithUnit</a></code>
- **molecularMass**: <code><a href="#valuewithunit">ValueWithUnit</a></code>
- **poissonsRatio**: <code>number</code>
- **properties**: <code>Object&lt;string, <a href="#anyproperty">AnyProperty</a>&gt;</code> Additional properties of the material
- **relativePermittivity**: <code>number</code>
- **specificHeatCapacity**: <code><a href="#valuewithunit">ValueWithUnit</a></code>
- **statesOfMatter**: <code>array</code> The states of matter of the material under conditions considered in the simulation.

  - _All items_: _One of_:

    - <code>"gas"</code>
    - <code>"liquid"</code>
    - <code>"other"</code>
    - <code>"plasma"</code>
    - <code>"solid"</code>
    - <code>"vacuum"</code>
- **tensileUltimateStrength**: <code><a href="#valuewithunit">ValueWithUnit</a></code>
- **tensileYieldStrength**: <code><a href="#valuewithunit">ValueWithUnit</a></code>
- **thermalConductivity**: <code><a href="#valuewithunit">ValueWithUnit</a></code>
- **thermalExpansionCoefficient**: <code><a href="#valuewithunit">ValueWithUnit</a></code>
- **title**: <code>string</code>  (_Required_) The descriptive name of the material.
- **youngsModulus**: <code><a href="#valuewithunit">ValueWithUnit</a></code>

#### NumberParameter

<code>object</code> A user parameter of type number which represent either an input to or output of the design. This maps to the [Json Schema: number, integer](https://json-schema.org/understanding-json-schema/reference/numeric); [FMI: Float32, Float64, Int8, Uint8, Int16, UInt16, Int32, Unit32, Int64, Unit64](https://fmi-standard.org/docs/3.0.2/#definition-of-types), Pacz: Integer, Real; [optiSLang: Integer, Unsigned Integer, Real](https://ansyshelp.ansys.com/account/secured?returnurl=/Views/Secured/corp/v251/en/opti_ug/opti_ug_data_types.html?q=parameter%20data%20types) and arrays of the above.

_Example_:

```json
{
  "type": "number",
  "format": "int8",
  "minimum": 0,
  "maximum": 0,
  "exclusiveMinimum": 0,
  "exclusiveMaximum": 0,
  "multiValue": true,
  "enum": [
    0
  ],
  "label": "string",
  "description": "string",
  "usage": "input",
  "units": "string",
  "default": 0
}
```

_Properties_:

- **default**: <code>number | number[]</code> The default value(s).
- **description**: <code>string</code> A human-readable description.
- **enum**: <code>number[]</code> A list of allowed values.
- **exclusiveMaximum**: <code>number</code> The exclusive maximum value.
- **exclusiveMinimum**: <code>number</code> The exclusive minimum value.
- **format**: The number size/precision. (See [OpenAPI number formats](https://swagger.io/docs/specification/v3_0/data-models/data-types/#numbers)

  _One of_:

  - <code>"float32"</code>
  - <code>"float64"</code>
  - <code>"int8"</code>
  - <code>"int16"</code>
  - <code>"int32"</code>
  - <code>"int64"</code>
  - <code>"uint8"</code>
  - <code>"uint16"</code>
  - <code>"uint32"</code>
  - <code>"uint64"</code>
- **label**: <code>string</code> A human-readable label.
- **maximum**: <code>number</code> The maximum value.
- **minimum**: <code>number</code> The minimum value.
- **multiValue**: <code>boolean</code> Indicates if the parameter can have multiple values (is an array).
- **type**: <code>"number"</code>  (_Required_) The data type.
- **units**: <code>string</code> The units of measurement for the parameter.
- **usage**: <code><a href="#parameterusage">ParameterUsage</a></code>  (_Required_)

#### NumberProperty

<code>object</code>

_Example_:

```json
{
  "type": "number",
  "label": "string",
  "value": 0,
  "units": "string"
}
```

_Properties_:

- **label**: <code>string</code>
- **type**: <code>"integer" | "number"</code>  (_Required_)
- **units**: <code>string</code>
- **value**: <code>number | number[]</code>  (_Required_)

#### ObjectProperty

<code>object</code>

_Example_:

```json
{
  "type": "object",
  "label": "string",
  "properties": {
    "additionalProp1": {
      "type": "number",
      "label": "string",
      "value": 0,
      "units": "string"
    },
    "additionalProp2": {
      "type": "string",
      "label": "string",
      "value": "string"
    },
    "additionalProp3": {
      "type": "boolean",
      "label": "string",
      "value": true
    }
  }
}
```

_Properties_:

- **label**: <code>string</code>
- **properties**: <code>Object&lt;string, <a href="#anyproperty">AnyProperty</a>&gt;</code>  (_Required_)
- **type**: <code>"object"</code>  (_Required_)

#### Parameter

<code><a href="#booleanparameter">BooleanParameter</a> | <a href="#datetimeparameter">DateTimeParameter</a> | <a href="#numberparameter">NumberParameter</a> | <a href="#stringparameter">StringParameter</a> | <a href="#uriparameter">UriParameter</a></code>

_Example_:

```json
{
  "type": "number",
  "format": "int8",
  "minimum": 0,
  "maximum": 0,
  "exclusiveMinimum": 0,
  "exclusiveMaximum": 0,
  "multiValue": true,
  "enum": [
    0
  ],
  "label": "string",
  "description": "string",
  "usage": "input",
  "units": "string",
  "default": 0
}
```

#### ParameterUsage

<code>"input" | "output"</code> The intended usage of the parameter.

#### StringParameter

<code>object</code> A user parameter of type string which represent either an input to or output of the design. This can be an individual value or an array of values.

_Example_:

```json
{
  "type": "string",
  "minLength": 0,
  "maxLength": 0,
  "multiValue": true,
  "enum": [
    "string"
  ],
  "label": "string",
  "description": "string",
  "usage": "input",
  "default": "string"
}
```

_Properties_:

- **default**: <code>string | string[]</code> The default value(s).
- **description**: <code>string</code> A human-readable description.
- **enum**: <code>string[]</code> A list of allowed values.
- **label**: <code>string</code> A human-readable label.
- **maxLength**: <code>number</code> The maximum length.
- **minLength**: <code>number</code> The minimum length.
- **multiValue**: <code>boolean</code> Indicates if the parameter can have multiple values (is an array).
- **type**: <code>"string"</code>  (_Required_) The data type.
- **usage**: <code><a href="#parameterusage">ParameterUsage</a></code>  (_Required_)

#### StringProperty

<code>object</code>

_Example_:

```json
{
  "type": "string",
  "label": "string",
  "value": "string"
}
```

_Properties_:

- **label**: <code>string</code>
- **type**: <code>"string"</code>  (_Required_)
- **value**: <code>string | string[]</code>  (_Required_)

#### TableProperty

<code>object</code>

_Example_:

```json
{
  "type": "table",
  "label": "string",
  "columns": [
    {}
  ],
  "values": [
    [
      "string",
      0,
      true,
      null
    ]
  ]
}
```

_Properties_:

- **columns**: <code>Array&lt;<a href="#parameter">Parameter</a>&gt;</code>  (_Required_)
- **label**: <code>string</code>
- **type**: <code>"table"</code>  (_Required_)
- **values**: <code>Array&lt;Array&lt;boolean | null | number | string&gt;&gt;</code>  (_Required_)

#### UriParameter

<code>object</code> A user parameter which represents the location of a blob and is either an input to or output of the design. This can be an individual value or an array of values.

_Example_:

```json
{
  "type": "uri-reference",
  "multiValue": true,
  "label": "string",
  "description": "string",
  "usage": "input",
  "default": "path/index.html"
}
```

_Properties_:

- **default**: <code>Array&lt;string /\*uri-reference\*/&gt; | string /\*uri-reference\*/</code> The default value(s).
- **description**: <code>string</code> A human-readable description.
- **label**: <code>string</code> A human-readable label.
- **multiValue**: <code>boolean</code> Indicates if the parameter can have multiple values (is an array).
- **type**: <code>"uri-reference"</code>  (_Required_) The data type.
- **usage**: <code><a href="#parameterusage">ParameterUsage</a></code>  (_Required_)

#### UriProperty

<code>object</code>

_Example_:

```json
{
  "type": "uri-reference",
  "label": "string",
  "value": "path/index.html"
}
```

_Properties_:

- **label**: <code>string</code>
- **type**: <code>"uri-reference"</code>  (_Required_)
- **value**: <code>Array&lt;string /\*uri-reference\*/&gt; | string /\*uri-reference\*/</code>  (_Required_)

#### ValueWithUnit

<code>object</code>

_Example_:

```json
{
  "value": 0,
  "units": "string"
}
```

_Properties_:

- **units**: <code>string</code>  (_Required_)
- **value**: <code>number</code>  (_Required_)